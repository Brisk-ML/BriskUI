"""Project settings API routes.

Reads and writes project configuration from the .brisk/.env file.
"""

import os
import re
import shutil

import fastapi
import pydantic

from brisk_ui.services.env_file import EnvFileService


def sanitize_directory_name(name: str) -> str:
    """Convert a project name to a valid directory name.
    
    - Converts to lowercase
    - Replaces spaces and special chars with hyphens
    - Removes consecutive hyphens
    - Strips leading/trailing hyphens
    """
    # Convert to lowercase and replace spaces/special chars with hyphens
    sanitized = re.sub(r'[^a-zA-Z0-9]+', '-', name.lower())
    # Remove consecutive hyphens
    sanitized = re.sub(r'-+', '-', sanitized)
    # Strip leading/trailing hyphens
    sanitized = sanitized.strip('-')
    return sanitized or "project"

router = fastapi.APIRouter()


class ProjectSettings(pydantic.BaseModel):
    """Project settings model."""
    project_name: str = ""
    project_path: str = ""
    project_description: str = ""


class ProjectSettingsUpdate(pydantic.BaseModel):
    """Partial update model for project settings."""
    project_name: str | None = None
    project_path: str | None = None
    project_description: str | None = None


@router.get("", response_model=ProjectSettings)
async def get_project_settings(request: fastapi.Request):
    """Get project settings from .env file."""
    settings = request.app.state.settings
    env_service = EnvFileService(settings.project_path)
    
    env_data = env_service.read()
    
    return ProjectSettings(
        project_name=env_data.get("project-name", ""),
        project_path=env_data.get("project-path", str(settings.project_path)),
        project_description=env_data.get("project-description", ""),
    )


class CreateProjectRequest(pydantic.BaseModel):
    """Request model for creating/initializing a project."""
    project_name: str
    project_path: str = ""
    project_description: str = ""


class CreateProjectResponse(pydantic.BaseModel):
    """Response model for project creation."""
    project_name: str
    project_path: str
    project_description: str
    directory_name: str


@router.post("", response_model=CreateProjectResponse)
async def create_project(
    request: fastapi.Request,
    data: CreateProjectRequest,
):
    """Create or initialize project settings.
    
    In create mode (BRISK_UI_CREATE_MODE=true):
    - Creates a new directory named after the sanitized project name
    - The project_path setting is the parent directory
    
    In normal mode:
    - Creates .brisk directory and .env file in existing project directory
    """
    settings = request.app.state.settings
    create_mode = os.environ.get("BRISK_UI_CREATE_MODE", "false") == "true"
    
    if create_mode:
        # In create mode, use user-provided project_path if given, else settings.project_path
        import pathlib
        parent_dir = pathlib.Path(data.project_path) if data.project_path else settings.project_path
        
        # Validate parent directory exists
        if not parent_dir.exists():
            raise fastapi.HTTPException(
                status_code=400,
                detail=f"Parent directory does not exist: {parent_dir}"
            )
        if not parent_dir.is_dir():
            raise fastapi.HTTPException(
                status_code=400,
                detail=f"Path is not a directory: {parent_dir}"
            )
        
        # Create a subdirectory named after the project
        dir_name = sanitize_directory_name(data.project_name)
        project_dir = parent_dir / dir_name
        
        # Check if directory already exists
        if project_dir.exists():
            raise fastapi.HTTPException(
                status_code=400,
                detail=f"Project directory already exists: {project_dir}"
            )
        
        # Create the project directory and .brisk subdirectory
        brisk_dir = project_dir / ".brisk"
        brisk_dir.mkdir(parents=True, exist_ok=True)
        
        # Use the new project directory for env service
        env_service = EnvFileService(project_dir)
        actual_project_path = str(project_dir)
    else:
        # Normal mode - use existing project directory
        dir_name = settings.project_path.name
        brisk_dir = settings.project_path / ".brisk"
        brisk_dir.mkdir(parents=True, exist_ok=True)
        env_service = EnvFileService(settings.project_path)
        actual_project_path = data.project_path or str(settings.project_path)
    
    # Write project settings to .env
    env_data = {
        "project-name": data.project_name,
        "project-path": actual_project_path,
        "project-description": data.project_description,
    }
    env_service.write(env_data)
    
    return CreateProjectResponse(
        project_name=env_data["project-name"],
        project_path=env_data["project-path"],
        project_description=env_data["project-description"],
        directory_name=dir_name,
    )


@router.patch("", response_model=ProjectSettings)
async def update_project_settings(
    request: fastapi.Request,
    update: ProjectSettingsUpdate,
):
    """Update project settings in .env file."""
    settings = request.app.state.settings
    env_service = EnvFileService(settings.project_path)
    
    env_data = env_service.read()
    
    # Update only provided fields
    if update.project_name is not None:
        env_data["project-name"] = update.project_name
    if update.project_path is not None:
        env_data["project-path"] = update.project_path
    if update.project_description is not None:
        env_data["project-description"] = update.project_description
    
    env_service.write(env_data)
    
    return ProjectSettings(
        project_name=env_data.get("project-name", ""),
        project_path=env_data.get("project-path", str(settings.project_path)),
        project_description=env_data.get("project-description", ""),
    )


class DataManagerConfig(pydantic.BaseModel):
    """DataManager configuration model matching Python DataManager class."""
    test_size: float = 0.2
    n_splits: int = 5
    split_method: str = "shuffle"  # "shuffle" or "kfold"
    group_column: str | None = None
    stratified: bool = False
    random_state: int | None = None


class WriteDataFileRequest(pydantic.BaseModel):
    """Request model for writing data.py file."""
    base_data_manager: DataManagerConfig


class WriteDataFileResponse(pydantic.BaseModel):
    """Response model for data.py file creation."""
    success: bool
    file_path: str


@router.post("/data-file", response_model=WriteDataFileResponse)
async def write_data_file(
    request: fastapi.Request,
    data: WriteDataFileRequest,
):
    """Write the data.py file with BASE_DATA_MANAGER configuration.
    
    Creates a data.py file in the project directory with the DataManager
    configuration specified by the user.
    """
    settings = request.app.state.settings
    create_mode = os.environ.get("BRISK_UI_CREATE_MODE", "false") == "true"
    
    # In create mode, we need to find the actual project directory
    # by looking at what was created
    if create_mode:
        # The env file should have been written with the actual path
        env_service = EnvFileService(settings.project_path)
        # Find the most recently created project directory
        # For now, read from the env file that was just written
        subdirs = [d for d in settings.project_path.iterdir() if d.is_dir() and not d.name.startswith('.')]
        if subdirs:
            # Get most recent
            project_dir = max(subdirs, key=lambda d: d.stat().st_mtime)
        else:
            raise fastapi.HTTPException(
                status_code=400,
                detail="No project directory found. Create project first."
            )
    else:
        project_dir = settings.project_path
    
    data_file_path = project_dir / "data.py"
    
    # Build the DataManager instantiation string
    dm = data.base_data_manager
    params = []
    
    # Always include test_size
    params.append(f"    test_size = {dm.test_size}")
    
    # Include n_splits if not default
    if dm.n_splits != 5:
        params.append(f"    n_splits = {dm.n_splits}")
    
    # Include split_method if not default
    if dm.split_method != "shuffle":
        params.append(f'    split_method = "{dm.split_method}"')
    
    # Include group_column if set
    if dm.group_column:
        params.append(f'    group_column = "{dm.group_column}"')
    
    # Include stratified if True
    if dm.stratified:
        params.append(f"    stratified = {dm.stratified}")
    
    # Include random_state if set
    if dm.random_state is not None:
        params.append(f"    random_state = {dm.random_state}")
    
    params_str = ",\n".join(params)
    
    file_content = f'''# data.py
from brisk.data.data_manager import DataManager

BASE_DATA_MANAGER = DataManager(
{params_str}
)
'''
    
    try:
        with open(data_file_path, "w") as f:
            f.write(file_content)
        
        return WriteDataFileResponse(
            success=True,
            file_path=str(data_file_path)
        )
    except Exception as e:
        raise fastapi.HTTPException(
            status_code=500,
            detail=f"Failed to write data.py: {str(e)}"
        )


class AlgorithmWrapperConfig(pydantic.BaseModel):
    """Configuration for a single AlgorithmWrapper."""
    name: str  # Unique identifier
    display_name: str  # Human-readable name
    class_name: str  # Python class name (e.g., "Ridge")
    class_module: str  # Python module (e.g., "sklearn.linear_model")
    default_params: dict[str, str | int | float | bool | None] = {}
    use_defaults: bool = True


class WriteAlgorithmsFileRequest(pydantic.BaseModel):
    """Request model for writing algorithms.py file."""
    wrappers: list[AlgorithmWrapperConfig]


class WriteAlgorithmsFileResponse(pydantic.BaseModel):
    """Response model for algorithms.py file creation."""
    success: bool
    file_path: str


@router.post("/algorithms-file", response_model=WriteAlgorithmsFileResponse)
async def write_algorithms_file(
    request: fastapi.Request,
    data: WriteAlgorithmsFileRequest,
):
    """Write the algorithms.py file with ALGORITHM_CONFIG.
    
    Creates an algorithms.py file in the project directory with the
    AlgorithmWrapper instances specified by the user.
    """
    settings = request.app.state.settings
    create_mode = os.environ.get("BRISK_UI_CREATE_MODE", "false") == "true"
    
    # In create mode, we need to find the actual project directory
    if create_mode:
        subdirs = [d for d in settings.project_path.iterdir() if d.is_dir() and not d.name.startswith('.')]
        if subdirs:
            project_dir = max(subdirs, key=lambda d: d.stat().st_mtime)
        else:
            raise fastapi.HTTPException(
                status_code=400,
                detail="No project directory found. Create project first."
            )
    else:
        project_dir = settings.project_path
    
    algorithms_file_path = project_dir / "algorithms.py"
    
    # Collect unique imports needed
    imports_by_module: dict[str, set[str]] = {}
    for wrapper in data.wrappers:
        if wrapper.class_module not in imports_by_module:
            imports_by_module[wrapper.class_module] = set()
        imports_by_module[wrapper.class_module].add(wrapper.class_name)
    
    # Build import statements
    import_lines = ["from brisk.configuration.algorithm_wrapper import AlgorithmWrapper"]
    import_lines.append("import brisk")
    
    for module, classes in sorted(imports_by_module.items()):
        classes_str = ", ".join(sorted(classes))
        import_lines.append(f"from {module} import {classes_str}")
    
    imports_str = "\n".join(import_lines)
    
    # Build AlgorithmWrapper instantiations
    wrapper_strs = []
    for wrapper in data.wrappers:
        params_parts = [
            f'        name="{wrapper.name}"',
            f'        display_name="{wrapper.display_name}"',
            f'        algorithm_class={wrapper.class_name}',
        ]
        
        # Add default_params if there are any and not using defaults
        if wrapper.default_params and not wrapper.use_defaults:
            params_dict_str = _format_params_dict(wrapper.default_params)
            params_parts.append(f'        default_params={params_dict_str}')
        
        params_str = ",\n".join(params_parts)
        wrapper_strs.append(f"    AlgorithmWrapper(\n{params_str},\n    )")
    
    wrappers_str = ",\n".join(wrapper_strs)
    
    file_content = f'''# algorithms.py
{imports_str}

ALGORITHM_CONFIG = brisk.AlgorithmCollection(
{wrappers_str}
)
'''
    
    try:
        with open(algorithms_file_path, "w") as f:
            f.write(file_content)
        
        return WriteAlgorithmsFileResponse(
            success=True,
            file_path=str(algorithms_file_path)
        )
    except Exception as e:
        raise fastapi.HTTPException(
            status_code=500,
            detail=f"Failed to write algorithms.py: {str(e)}"
        )


def _format_params_dict(params: dict[str, str | int | float | bool | None]) -> str:
    """Format a params dict as a Python dict literal."""
    if not params:
        return "{}"
    
    parts = []
    for key, value in params.items():
        if isinstance(value, str):
            parts.append(f'"{key}": "{value}"')
        elif isinstance(value, bool):
            parts.append(f'"{key}": {value}')
        elif value is None:
            parts.append(f'"{key}": None')
        else:
            parts.append(f'"{key}": {value}')
    
    return "{" + ", ".join(parts) + "}"


def _get_project_dir(settings, create_mode: bool):
    """Get the project directory based on mode."""
    if create_mode:
        subdirs = [d for d in settings.project_path.iterdir() if d.is_dir() and not d.name.startswith('.')]
        if subdirs:
            return max(subdirs, key=lambda d: d.stat().st_mtime)
        else:
            raise fastapi.HTTPException(
                status_code=400,
                detail="No project directory found. Create project first."
            )
    return settings.project_path


class WriteMetricsFileRequest(pydantic.BaseModel):
    """Request model for writing metrics.py file."""
    problem_type: str  # "classification" or "regression"


class WriteMetricsFileResponse(pydantic.BaseModel):
    """Response model for metrics.py file creation."""
    success: bool
    file_path: str


@router.post("/metrics-file", response_model=WriteMetricsFileResponse)
async def write_metrics_file(
    request: fastapi.Request,
    data: WriteMetricsFileRequest,
):
    """Write the metrics.py file based on problem type.
    
    Creates a metrics.py file in the project directory with the default
    metrics for the specified problem type.
    """
    settings = request.app.state.settings
    create_mode = os.environ.get("BRISK_UI_CREATE_MODE", "false") == "true"
    
    project_dir = _get_project_dir(settings, create_mode)
    metrics_file_path = project_dir / "metrics.py"
    
    # Select metrics based on problem type
    if data.problem_type == "classification":
        metrics_line = "*brisk.CLASSIFICATION_METRICS"
    else:
        metrics_line = "*brisk.REGRESSION_METRICS"
    
    file_content = f'''# metrics.py
import brisk

METRIC_CONFIG = brisk.MetricManager(
    {metrics_line}
)
'''
    
    try:
        with open(metrics_file_path, "w") as f:
            f.write(file_content)
        
        return WriteMetricsFileResponse(
            success=True,
            file_path=str(metrics_file_path)
        )
    except Exception as e:
        raise fastapi.HTTPException(
            status_code=500,
            detail=f"Failed to write metrics.py: {str(e)}"
        )


class WriteEvaluatorsFileResponse(pydantic.BaseModel):
    """Response model for evaluators.py file creation."""
    success: bool
    file_path: str


@router.post("/evaluators-file", response_model=WriteEvaluatorsFileResponse)
async def write_evaluators_file(request: fastapi.Request):
    """Write the evaluators.py file (template).
    
    Creates a boilerplate evaluators.py file in the project directory
    for custom evaluator registration.
    """
    settings = request.app.state.settings
    create_mode = os.environ.get("BRISK_UI_CREATE_MODE", "false") == "true"
    
    project_dir = _get_project_dir(settings, create_mode)
    evaluators_file_path = project_dir / "evaluators.py"
    
    file_content = '''# evaluators.py
# Define custom evaluation methods here to integrate with Brisk's builtin tools
from brisk.evaluation.evaluators.registry import EvaluatorRegistry
from brisk import PlotEvaluator, MeasureEvaluator

def register_custom_evaluators(registry: EvaluatorRegistry, plot_settings) -> None:
    # registry.register(
    # Initalize an evaluator instance here to register
    # )
    pass
'''
    
    try:
        with open(evaluators_file_path, "w") as f:
            f.write(file_content)
        
        return WriteEvaluatorsFileResponse(
            success=True,
            file_path=str(evaluators_file_path)
        )
    except Exception as e:
        raise fastapi.HTTPException(
            status_code=500,
            detail=f"Failed to write evaluators.py: {str(e)}"
        )


# --- Workflow file ---

class WorkflowStepConfig(pydantic.BaseModel):
    """A single workflow step (evaluator call)."""
    evaluator_id: str
    method_name: str
    args: dict = {}


class WriteWorkflowFileRequest(pydantic.BaseModel):
    """Request model for writing workflows/<problem_type>.py file."""
    problem_type: str  # "classification" or "regression"
    steps: list[WorkflowStepConfig]


class WriteWorkflowFileResponse(pydantic.BaseModel):
    """Response model for workflow file creation."""
    success: bool
    file_path: str


# Methods that take X, y as np.ndarray (emit X.values, y.values)
_WORKFLOW_ARRAY_DATA_METHODS = frozenset({
    "confusion_matrix",
    "plot_confusion_heatmap",
    "plot_roc_curve",
    "plot_precision_recall_curve",
})


def _format_workflow_step_call(step: WorkflowStepConfig, problem_type: str) -> str:
    """Format a single workflow step as a Python method call.
    Uses self.model for model arg; X_train, X_test, y_train, y_test from workflow params.
    """
    method = step.method_name
    args = step.args or {}

    def get_data_var(key: str, default: str = "X_test") -> str:
        v = args.get(key)
        if v is None or v == "":
            return default
        return str(v)

    if method == "evaluate_model":
        X = get_data_var("X", "X_test")
        y = get_data_var("y", "y_test")
        metrics_raw = args.get("metrics") or "MAE"
        if isinstance(metrics_raw, list):
            metrics_str = ", ".join(f'"{m}"' for m in metrics_raw)
        else:
            parts = [s.strip() for s in str(metrics_raw).split(",") if s.strip()]
            metrics_str = ", ".join(f'"{p}"' for p in parts) if parts else '"MAE"'
        filename = args.get("filename") or "evaluate_model"
        return f'        self.evaluate_model(self.model, {X}, {y}, [{metrics_str}], "{filename}")'
    if method == "evaluate_model_cv":
        X = get_data_var("X", "X_train")
        y = get_data_var("y", "y_train")
        metrics_raw = args.get("metrics") or "MAE"
        if isinstance(metrics_raw, list):
            metrics_str = ", ".join(f'"{m}"' for m in metrics_raw)
        else:
            parts = [s.strip() for s in str(metrics_raw).split(",") if s.strip()]
            metrics_str = ", ".join(f'"{p}"' for p in parts) if parts else '"MAE"'
        filename = args.get("filename") or "evaluate_model_cv"
        cv = args.get("cv")
        cv_val = int(cv) if cv is not None and str(cv).strip() != "" else 5
        return f'        self.evaluate_model_cv(self.model, {X}, {y}, [{metrics_str}], "{filename}", cv={cv_val})'
    if method == "plot_pred_vs_obs":
        X = get_data_var("X", "X_test")
        y = get_data_var("y", "y_test")
        filename = args.get("filename") or "pred_vs_obs"
        return f'        self.plot_pred_vs_obs(self.model, {X}, {y}, "{filename}")'
    if method == "plot_learning_curve":
        X_train = get_data_var("X", "X_train")
        y_train = get_data_var("y", "y_train")
        filename = args.get("filename") or "learning_curve"
        cv = args.get("cv")
        cv_val = int(cv) if cv is not None and str(cv).strip() != "" else 5
        num_repeats = args.get("num_repeats")
        num_repeats_val = int(num_repeats) if num_repeats is not None and str(num_repeats).strip() != "" else 1
        n_jobs = args.get("n_jobs")
        n_jobs_val = int(n_jobs) if n_jobs is not None and str(n_jobs).strip() != "" else -1
        metric = args.get("metric") or "neg_mean_absolute_error"
        return f'        self.plot_learning_curve(self.model, {X_train}, {y_train}, filename="{filename}", cv={cv_val}, num_repeats={num_repeats_val}, n_jobs={n_jobs_val}, metric="{metric}")'
    if method == "plot_feature_importance":
        X = get_data_var("X", "X_train")
        y = get_data_var("y", "y_train")
        threshold = args.get("threshold")
        thresh_val = int(threshold) if threshold is not None and str(threshold).strip() != "" else 10
        filename = args.get("filename") or "feature_importance"
        metric = args.get("metric") or "neg_mean_absolute_error"
        num_rep = args.get("num_rep")
        num_rep_val = int(num_rep) if num_rep is not None and str(num_rep).strip() != "" else 5
        return f'        self.plot_feature_importance(self.model, {X}, {y}, {thresh_val}, feature_names, "{filename}", "{metric}", {num_rep_val})'
    if method == "plot_residuals":
        X = get_data_var("X", "X_test")
        y = get_data_var("y", "y_test")
        filename = args.get("filename") or "residuals"
        add_fit = args.get("add_fit_line")
        add_fit_val = "True" if add_fit else "False"
        return f'        self.plot_residuals(self.model, {X}, {y}, "{filename}", add_fit_line={add_fit_val})'
    if method == "hyperparameter_tuning":
        X_train = get_data_var("X", "X_train")
        y_train = get_data_var("y", "y_train")
        method_type = args.get("method") or "grid"
        scorer = args.get("scorer") or "neg_mean_absolute_error"
        kf = args.get("kf")
        kf_val = int(kf) if kf is not None and str(kf).strip() != "" else 5
        num_rep = args.get("num_rep")
        num_rep_val = int(num_rep) if num_rep is not None and str(num_rep).strip() != "" else 3
        n_jobs = args.get("n_jobs")
        n_jobs_val = int(n_jobs) if n_jobs is not None and str(n_jobs).strip() != "" else -1
        plot_res = args.get("plot_results")
        plot_res_val = "True" if plot_res else "False"
        return f'        self.hyperparameter_tuning(self.model, "{method_type}", {X_train}, {y_train}, "{scorer}", {kf_val}, {num_rep_val}, {n_jobs_val}, plot_results={plot_res_val})'
    if method == "confusion_matrix":
        X = get_data_var("X", "X_test")
        y = get_data_var("y", "y_test")
        filename = args.get("filename") or "confusion_matrix"
        return f'        self.confusion_matrix(self.model, {X}.values, {y}.values, "{filename}")'
    if method == "plot_confusion_heatmap":
        X = get_data_var("X", "X_test")
        y = get_data_var("y", "y_test")
        filename = args.get("filename") or "confusion_heatmap"
        return f'        self.plot_confusion_heatmap(self.model, {X}.values, {y}.values, "{filename}")'
    if method == "plot_roc_curve":
        X = get_data_var("X", "X_test")
        y = get_data_var("y", "y_test")
        filename = args.get("filename") or "roc_curve"
        pos_label = args.get("pos_label")
        pos_val = int(pos_label) if pos_label is not None and str(pos_label).strip() != "" else 1
        return f'        self.plot_roc_curve(self.model, {X}.values, {y}.values, "{filename}", pos_label={pos_val})'
    if method == "plot_precision_recall_curve":
        X = get_data_var("X", "X_test")
        y = get_data_var("y", "y_test")
        filename = args.get("filename") or "precision_recall_curve"
        pos_label = args.get("pos_label")
        pos_val = int(pos_label) if pos_label is not None and str(pos_label).strip() != "" else 1
        return f'        self.plot_precision_recall_curve(self.model, {X}.values, {y}.values, "{filename}", pos_label={pos_val})'
    if method == "plot_shapley_values":
        X = get_data_var("X", "X_test")
        y = get_data_var("y", "y_test")
        filename = args.get("filename") or "shapley_values"
        plot_type = args.get("plot_type") or "bar"
        return f'        self.plot_shapley_values(self.model, {X}, {y}, filename="{filename}", plot_type="{plot_type}")'
    if method == "save_model":
        filename = args.get("filename") or "model"
        return f'        self.save_model(self.model, "{filename}")'
    return ""


@router.post("/workflow-file", response_model=WriteWorkflowFileResponse)
async def write_workflow_file(
    request: fastapi.Request,
    data: WriteWorkflowFileRequest,
):
    """Write the workflow file to workflows/<problem_type>.py.
    
    Creates a workflow file with class Regression or Classification
    and def workflow(self, X_train, X_test, y_train, y_test, output_dir, feature_names).
    """
    settings = request.app.state.settings
    create_mode = os.environ.get("BRISK_UI_CREATE_MODE", "false") == "true"
    project_dir = _get_project_dir(settings, create_mode)
    workflows_dir = project_dir / "workflows"
    workflows_dir.mkdir(parents=True, exist_ok=True)
    problem_type = data.problem_type
    if problem_type not in ("classification", "regression"):
        problem_type = "regression"
    class_name = problem_type.capitalize()
    workflow_file_path = workflows_dir / f"{problem_type}.py"

    step_lines = []
    for step in data.steps:
        line = _format_workflow_step_call(step, problem_type)
        if line:
            step_lines.append(line)

    body = "\n".join(step_lines) if step_lines else "        pass"

    file_content = f'''# workflow.py
# Define the workflow for training and evaluating models

from brisk.training.workflow import Workflow


class {class_name}(Workflow):
    def workflow(self, X_train, X_test, y_train, y_test, output_dir, feature_names):
{body}
'''
    try:
        with open(workflow_file_path, "w") as f:
            f.write(file_content)
        return WriteWorkflowFileResponse(
            success=True,
            file_path=str(workflow_file_path)
        )
    except Exception as e:
        raise fastapi.HTTPException(
            status_code=500,
            detail=f"Failed to write workflow file: {str(e)}"
        )


class ExperimentGroupDataConfig(pydantic.BaseModel):
    """DataManager config for an experiment group (data_config parameter)."""
    test_size: float | None = None
    n_splits: int | None = None
    split_method: str | None = None
    group_column: str | None = None
    stratified: bool | None = None
    random_state: int | None = None
    preprocessors: list[dict] | None = None  # list of {type, config} for each preprocessor


class ExperimentGroupConfig(pydantic.BaseModel):
    """Configuration for a single experiment group."""
    name: str
    description: str = ""
    dataset_file_name: str
    dataset_table_name: str | None = None
    algorithms: list[str]
    use_default_data_manager: bool = True
    data_config: ExperimentGroupDataConfig | None = None


class PlotSettingsPayload(pydantic.BaseModel):
    """PlotSettings payload; only non-default values are written."""
    file_format: str | None = None
    transparent: bool | None = None
    width: int | None = None
    height: int | None = None
    dpi: int | None = None
    primary_color: str | None = None
    secondary_color: str | None = None
    accent_color: str | None = None


class WriteSettingsFileRequest(pydantic.BaseModel):
    """Request model for writing settings.py file."""
    problem_type: str  # "classification" or "regression"
    default_algorithms: list[str]  # list of all algorithm names
    experiment_groups: list[ExperimentGroupConfig]
    plot_settings: PlotSettingsPayload | None = None


class WriteSettingsFileResponse(pydantic.BaseModel):
    """Response model for settings.py file creation."""
    success: bool
    file_path: str


def _format_preprocessor_instance(preproc_type: str, config: dict, problem_type: str) -> str:
    """Format a single preprocessor as Python instantiation code.
    Maps frontend preprocessor types/config to Brisk class constructors.
    Brisk pipeline order: Missing Data -> Categorical Encoding -> Scaling -> Feature Selection.
    """
    if preproc_type == "missing-data":
        strategy = config.get("strategy", "mean")
        if strategy == "drop":
            return "MissingDataPreprocessor(strategy=\"drop_rows\")"
        # strategy is impute with impute_method
        impute_method = strategy if strategy != "most_frequent" else "mode"
        constant_value = config.get("fillValue")
        if impute_method == "constant" and constant_value is not None:
            try:
                cv = float(constant_value)
                return f"MissingDataPreprocessor(strategy=\"impute\", impute_method=\"constant\", constant_value={cv})"
            except (TypeError, ValueError):
                return f"MissingDataPreprocessor(strategy=\"impute\", impute_method=\"constant\", constant_value=\"{constant_value}\")"
        return f"MissingDataPreprocessor(strategy=\"impute\", impute_method=\"{impute_method}\")"
    if preproc_type == "scaling":
        method = config.get("method", "standard")
        return f"ScalingPreprocessor(method=\"{method}\")"
    if preproc_type == "encoding":
        method = config.get("method", "label")
        if method == "target":
            method = "label"
        return f"CategoricalEncodingPreprocessor(method=\"{method}\")"
    if preproc_type == "feature-selection":
        method = config.get("method", "selectkbest")
        # Map frontend method to Brisk: variance|univariate -> selectkbest, recursive -> rfecv, lasso -> sequential
        brisk_method = {"variance": "selectkbest", "univariate": "selectkbest", "recursive": "rfecv", "lasso": "sequential"}.get(method, "selectkbest")
        n_features = config.get("nFeatures", 5)
        if n_features == "auto":
            n_features = 5
        try:
            n_features = int(n_features)
        except (TypeError, ValueError):
            n_features = 5
        return f"FeatureSelectionPreprocessor(method=\"{brisk_method}\", n_features_to_select={n_features}, feature_selection_cv=3, problem_type=\"{problem_type}\")"
    return ""


def _format_preprocessors_list(preprocessors: list[dict], problem_type: str) -> str | None:
    """Format preprocessors list for data_config. Returns Python code for the list or None."""
    if not preprocessors:
        return None
    # Brisk pipeline order: missing-data -> encoding -> scaling -> feature-selection
    order = ("missing-data", "encoding", "scaling", "feature-selection")
    ordered = []
    for key in order:
        for p in preprocessors:
            if p.get("type") == key:
                code = _format_preprocessor_instance(key, p.get("config") or {}, problem_type)
                if code:
                    ordered.append(f"            {code},")
                break
    if not ordered:
        return None
    return "[\n" + "\n".join(ordered) + "\n        ]"


@router.post("/settings-file", response_model=WriteSettingsFileResponse)
async def write_settings_file(
    request: fastapi.Request,
    data: WriteSettingsFileRequest,
):
    """Write the settings.py file with Configuration.
    
    Creates a settings.py file in the project directory with the
    Configuration and experiment groups.
    """
    settings = request.app.state.settings
    create_mode = os.environ.get("BRISK_UI_CREATE_MODE", "false") == "true"
    
    project_dir = _get_project_dir(settings, create_mode)
    settings_file_path = project_dir / "settings.py"
    
    # PlotSettings: only include non-default kwargs (Brisk PlotSettings defaults)
    _plot_defaults = {
        "file_format": "png",
        "transparent": False,
        "width": 10,
        "height": 8,
        "dpi": 300,
        "primary_color": "#1175D5",
        "secondary_color": "#00A878",
        "accent_color": "#DE6B48",
    }
    plot_kwargs: dict[str, str | int | bool] = {}
    if data.plot_settings:
        ps = data.plot_settings
        if ps.file_format is not None and ps.file_format != _plot_defaults["file_format"]:
            plot_kwargs["file_format"] = ps.file_format
        if ps.transparent is not None and ps.transparent != _plot_defaults["transparent"]:
            plot_kwargs["transparent"] = ps.transparent
        if ps.width is not None and ps.width != _plot_defaults["width"]:
            plot_kwargs["width"] = ps.width
        if ps.height is not None and ps.height != _plot_defaults["height"]:
            plot_kwargs["height"] = ps.height
        if ps.dpi is not None and ps.dpi != _plot_defaults["dpi"]:
            plot_kwargs["dpi"] = ps.dpi
        if ps.primary_color is not None and ps.primary_color != _plot_defaults["primary_color"]:
            plot_kwargs["primary_color"] = ps.primary_color
        if ps.secondary_color is not None and ps.secondary_color != _plot_defaults["secondary_color"]:
            plot_kwargs["secondary_color"] = ps.secondary_color
        if ps.accent_color is not None and ps.accent_color != _plot_defaults["accent_color"]:
            plot_kwargs["accent_color"] = ps.accent_color

    # Format algorithm list
    algorithms_str = ", ".join(f'"{a}"' for a in data.default_algorithms)
    
    # Check if any group needs preprocessor imports
    needs_preprocessors_import = any(
        group.data_config and group.data_config.preprocessors
        for group in data.experiment_groups
    )
    
    # Build experiment group calls
    group_strs = []
    for group in data.experiment_groups:
        parts = [f'        name="{group.name}"']
        
        if group.description:
            parts.append(f'        description="{group.description}"')
        
        # Format datasets - tuple if table name exists
        if group.dataset_table_name:
            parts.append(f'        datasets=[("{group.dataset_file_name}", "{group.dataset_table_name}")]')
        else:
            parts.append(f'        datasets=["{group.dataset_file_name}"]')
        
        # Algorithms
        alg_str = ", ".join(f'"{a}"' for a in group.algorithms)
        parts.append(f'        algorithms=[{alg_str}]')
        
        # data_config - include when not using default data manager params, or when preprocessors are present
        dc = group.data_config
        has_dc_params = dc and (
            dc.test_size is not None or dc.n_splits is not None or dc.split_method is not None
            or dc.group_column is not None or dc.stratified is not None or dc.random_state is not None
        )
        has_preprocessors = dc and dc.preprocessors
        if has_preprocessors or (not group.use_default_data_manager and has_dc_params):
            dc_parts = []
            if dc:
                if dc.test_size is not None:
                    dc_parts.append(f'"test_size": {dc.test_size}')
                if dc.n_splits is not None:
                    dc_parts.append(f'"n_splits": {dc.n_splits}')
                if dc.split_method is not None:
                    dc_parts.append(f'"split_method": "{dc.split_method}"')
                if dc.group_column is not None:
                    dc_parts.append(f'"group_column": "{dc.group_column}"')
                if dc.stratified is not None:
                    dc_parts.append(f'"stratified": {dc.stratified}')
                if dc.random_state is not None:
                    dc_parts.append(f'"random_state": {dc.random_state}')
                preprocessors_code = _format_preprocessors_list(dc.preprocessors or [], data.problem_type)
                if preprocessors_code:
                    dc_parts.append(f'"preprocessors": {preprocessors_code}')
            if dc_parts:
                dc_str = ", ".join(dc_parts)
                parts.append(f'        data_config={{{dc_str}}}')
        
        params_str = ",\n".join(parts)
        group_strs.append(f"    config.add_experiment_group(\n{params_str},\n    )")
    
    groups_code = "\n\n".join(group_strs)
    
    preprocessors_import = ""
    if needs_preprocessors_import:
        preprocessors_import = "\nfrom brisk.data.preprocessing import (\n    MissingDataPreprocessor,\n    ScalingPreprocessor,\n    CategoricalEncodingPreprocessor,\n    FeatureSelectionPreprocessor,\n)\n"

    plot_settings_import = ""
    plot_settings_var = ""
    config_plot_arg = ""
    if plot_kwargs:
        plot_settings_import = "\nfrom brisk.theme.plot_settings import PlotSettings\n"
        kwargs_str = ", ".join(
            f'{k}="{v}"' if isinstance(v, str) else f"{k}={v}"
            for k, v in plot_kwargs.items()
        )
        plot_settings_var = f"\n    plot_settings = PlotSettings({kwargs_str})\n"
        config_plot_arg = ",\n        plot_settings=plot_settings"

    file_content = f'''# settings.py
from brisk.configuration.configuration import Configuration
from brisk.configuration.configuration_manager import ConfigurationManager
{preprocessors_import}{plot_settings_import}

def create_configuration() -> ConfigurationManager:
{plot_settings_var}    config = Configuration(
        default_workflow="{data.problem_type}",
        default_algorithms=[{algorithms_str}]{config_plot_arg}
    )

{groups_code}

    return config.build()
'''
    
    try:
        with open(settings_file_path, "w") as f:
            f.write(file_content)
        
        return WriteSettingsFileResponse(
            success=True,
            file_path=str(settings_file_path)
        )
    except Exception as e:
        raise fastapi.HTTPException(
            status_code=500,
            detail=f"Failed to write settings.py: {str(e)}"
        )


class DeleteResponse(pydantic.BaseModel):
    """Response model for project deletion."""
    success: bool
    message: str
    deleted_path: str


@router.delete("", response_model=DeleteResponse)
async def delete_project(request: fastapi.Request):
    """Delete the entire project directory.
    
    WARNING: This is a destructive operation that cannot be undone.
    It deletes the entire project directory, not just the .brisk folder.
    """
    settings = request.app.state.settings
    project_path = settings.project_path
    
    if not project_path.exists():
        raise fastapi.HTTPException(
            status_code=404,
            detail=f"Project directory not found: {project_path}"
        )
    
    # Safety check: ensure we're deleting a brisk project
    brisk_dir = project_path / ".brisk"
    if not brisk_dir.exists():
        raise fastapi.HTTPException(
            status_code=400,
            detail="Not a valid brisk project (missing .brisk directory)"
        )
    
    try:
        deleted_path = str(project_path)
        shutil.rmtree(project_path)
        return DeleteResponse(
            success=True,
            message="Project deleted successfully",
            deleted_path=deleted_path
        )
    except PermissionError:
        raise fastapi.HTTPException(
            status_code=403,
            detail="Permission denied: cannot delete project directory"
        )
    except Exception as e:
        raise fastapi.HTTPException(
            status_code=500,
            detail=f"Failed to delete project: {str(e)}"
        )
