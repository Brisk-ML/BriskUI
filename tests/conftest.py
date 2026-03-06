"""Shared fixtures for integration tests."""

import json
import pathlib
import shutil
import tempfile

import pytest
from starlette.testclient import TestClient

from brisk_ui.server import create_app

SAFE_ZONE_MARKER = "# ---- BRISK UI MANAGED BELOW (do not edit) ----"


@pytest.fixture()
def tmp_project(tmp_path: pathlib.Path):
    """Fresh project directory with minimal scaffolding."""
    brisk_dir = tmp_path / ".brisk"
    brisk_dir.mkdir()
    (tmp_path / "datasets").mkdir()
    (tmp_path / "workflows").mkdir()

    project_json = {
        "project_name": "test-project",
        "project_path": str(tmp_path),
        "project_description": "integration test project",
        "project_type": "classification",
        "datasets": [],
        "base_data_manager": {
            "test_size": 0.2,
            "n_splits": 5,
            "split_method": "shuffle",
            "stratified": False,
        },
    }
    (brisk_dir / "project.json").write_text(json.dumps(project_json, indent=2))
    return tmp_path


@pytest.fixture()
def client(tmp_project: pathlib.Path):
    """TestClient backed by a fresh temporary project."""
    app = create_app(project_path=tmp_project)
    with TestClient(app) as c:
        yield c


# ---------------------------------------------------------------------------
# Seed data for read tests
# ---------------------------------------------------------------------------

SEED_ALGORITHMS = f"""{SAFE_ZONE_MARKER}
# algorithms.py
from brisk.configuration.algorithm_wrapper import AlgorithmWrapper
import brisk
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

ALGORITHM_CONFIG = brisk.AlgorithmCollection(
    AlgorithmWrapper(
        name="logistic",
        display_name="Logistic Regression",
        algorithm_class=LogisticRegression,
    ),
    AlgorithmWrapper(
        name="rf",
        display_name="Random Forest",
        algorithm_class=RandomForestClassifier,
        default_params={{"n_estimators": 200, "max_depth": 10}},
    )
)
"""

SEED_WORKFLOW = f"""{SAFE_ZONE_MARKER}
# workflow.py
# Define the workflow for training and evaluating models

from brisk.training.workflow import Workflow


class Classification(Workflow):
    def workflow(self, X_train, X_test, y_train, y_test, output_dir, feature_names):
        self.model.fit(X_train, y_train)
        self.evaluate_model_cv(self.model, X_train, y_train, ["accuracy", "recall"], "evaluate_model_cv", cv=5)
        self.plot_roc_curve(self.model, X_test.values, y_test.values, "roc_curve", pos_label=1)
        self.model = self.hyperparameter_tuning(self.model, "grid", X_train, y_train, "f1_score", 5, 3, -1, plot_results=False)
"""

SEED_SETTINGS = f"""{SAFE_ZONE_MARKER}
# settings.py
from brisk.configuration.configuration import Configuration
from brisk.configuration.configuration_manager import ConfigurationManager

from brisk.theme.plot_settings import PlotSettings


def create_configuration() -> ConfigurationManager:

    plot_settings = PlotSettings(file_format="svg", dpi=150, primary_color="#FF0000")
    config = Configuration(
        default_workflow="classification",
        default_algorithms=["logistic", "rf"],
        plot_settings=plot_settings
    )

    config.add_experiment_group(
        name="main",
        description="Main experiment",
        datasets=["data.csv"],
        algorithms=["logistic", "rf"],
    )

    return config.build()
"""

SEED_METRICS = f"""{SAFE_ZONE_MARKER}
# metrics.py
import brisk

METRIC_CONFIG = brisk.MetricManager(
    *brisk.CLASSIFICATION_METRICS
)
"""

SEED_PROJECT_JSON = {
    "project_name": "seeded-project",
    "project_path": "__REPLACED__",
    "project_description": "A seeded project for read tests",
    "project_type": "classification",
    "datasets": [
        {
            "id": "data.csv",
            "file_name": "data.csv",
            "table_name": None,
            "file_type": "csv",
            "target_feature": "target",
            "features_count": 3,
            "observations_count": 100,
            "features": [
                {"name": "feat_a", "data_type": "float", "categorical": False},
                {"name": "feat_b", "data_type": "int", "categorical": False},
                {"name": "feat_c", "data_type": "str", "categorical": True},
                {"name": "target", "data_type": "int", "categorical": False},
            ],
            "data_manager": {"test_size": 0.3, "n_splits": 3},
            "preprocessors": [
                {"type": "scaling", "config": {"method": "standard"}},
            ],
        }
    ],
    "base_data_manager": {
        "test_size": 0.25,
        "n_splits": 10,
        "split_method": "shuffle",
        "stratified": True,
    },
}


@pytest.fixture()
def seeded_project(tmp_path: pathlib.Path):
    """Project directory pre-populated with known file contents for read tests."""
    brisk_dir = tmp_path / ".brisk"
    brisk_dir.mkdir()
    (tmp_path / "datasets").mkdir()
    (tmp_path / "workflows").mkdir()

    pj = dict(SEED_PROJECT_JSON)
    pj["project_path"] = str(tmp_path)
    (brisk_dir / "project.json").write_text(json.dumps(pj, indent=2))

    (tmp_path / "algorithms.py").write_text(SEED_ALGORITHMS)
    (tmp_path / "workflows" / "classification.py").write_text(SEED_WORKFLOW)
    (tmp_path / "settings.py").write_text(SEED_SETTINGS)
    (tmp_path / "metrics.py").write_text(SEED_METRICS)
    (tmp_path / "data.py").write_text(
        f"{SAFE_ZONE_MARKER}\n"
        "# data.py\n"
        "from brisk.data.data_manager import DataManager\n\n"
        "BASE_DATA_MANAGER = DataManager(\n"
        "    test_size = 0.25\n"
        ")\n"
    )

    return tmp_path


@pytest.fixture()
def seeded_client(seeded_project: pathlib.Path):
    """TestClient backed by the seeded project."""
    app = create_app(project_path=seeded_project)
    with TestClient(app) as c:
        yield c
