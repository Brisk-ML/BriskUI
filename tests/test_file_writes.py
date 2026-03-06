"""Category 1 + 3: Wizard file writes and Dashboard merge/update writes."""

import json
import pathlib

SAFE_ZONE_MARKER = "# ---- BRISK UI MANAGED BELOW (do not edit) ----"


# ============================================================================
# Category 1 – Wizard writes (fresh file creation)
# ============================================================================


class TestWizardWrites:
    """Tests that POST endpoints generate expected file contents from scratch."""

    def test_write_data_file(self, client, tmp_project):
        resp = client.post("/api/project/data-file", json={
            "base_data_manager": {
                "test_size": 0.3,
                "n_splits": 10,
                "split_method": "kfold",
                "stratified": True,
                "random_state": 42,
            }
        })
        assert resp.status_code == 200
        body = resp.json()
        assert body["success"] is True

        content = (tmp_project / "data.py").read_text()
        assert SAFE_ZONE_MARKER in content
        assert "DataManager(" in content
        assert "test_size = 0.3" in content
        assert "n_splits = 10" in content
        assert 'split_method = "kfold"' in content
        assert "stratified = True" in content
        assert "random_state = 42" in content

    def test_write_data_file_defaults_omitted(self, client, tmp_project):
        """Only non-default params should appear in the generated file."""
        resp = client.post("/api/project/data-file", json={
            "base_data_manager": {"test_size": 0.2}
        })
        assert resp.status_code == 200

        content = (tmp_project / "data.py").read_text()
        assert "test_size = 0.2" in content
        assert "n_splits" not in content
        assert "split_method" not in content
        assert "stratified" not in content

    def test_write_algorithms_file(self, client, tmp_project):
        resp = client.post("/api/project/algorithms-file", json={
            "wrappers": [
                {
                    "name": "ridge",
                    "display_name": "Ridge Regression",
                    "class_name": "Ridge",
                    "class_module": "sklearn.linear_model",
                    "default_params": {"alpha": 1.0},
                    "search_space": {"alpha": [0.1, 1.0, 10.0]},
                    "use_defaults": False,
                },
                {
                    "name": "rf",
                    "display_name": "Random Forest",
                    "class_name": "RandomForestRegressor",
                    "class_module": "sklearn.ensemble",
                    "default_params": {},
                    "search_space": {},
                    "use_defaults": True,
                },
            ]
        })
        assert resp.status_code == 200
        assert resp.json()["success"] is True

        content = (tmp_project / "algorithms.py").read_text()
        assert SAFE_ZONE_MARKER in content
        assert "brisk.AlgorithmCollection" in content
        assert "AlgorithmWrapper" in content
        assert 'name="ridge"' in content
        assert 'name="rf"' in content
        assert "from sklearn.linear_model import Ridge" in content
        assert "from sklearn.ensemble import RandomForestRegressor" in content
        assert 'default_params={"alpha": 1.0}' in content
        assert 'hyperparameters={"alpha": [0.1, 1.0, 10.0]}' in content

    def test_write_workflow_file_classification(self, client, tmp_project):
        resp = client.post("/api/project/workflow-file", json={
            "problem_type": "classification",
            "steps": [
                {"evaluator_id": "fit_model", "method_name": "fit_model", "args": {}},
                {
                    "evaluator_id": "evaluate_model_cv",
                    "method_name": "evaluate_model_cv",
                    "args": {"metrics": ["accuracy", "f1"], "cv": 5},
                },
                {
                    "evaluator_id": "plot_roc_curve",
                    "method_name": "plot_roc_curve",
                    "args": {"pos_label": 1},
                },
            ],
        })
        assert resp.status_code == 200
        assert resp.json()["success"] is True

        wf_path = tmp_project / "workflows" / "classification.py"
        assert wf_path.exists()
        content = wf_path.read_text()
        assert "class Classification(Workflow)" in content
        assert "self.model.fit(X_train, y_train)" in content
        assert "self.evaluate_model_cv(" in content
        assert '"accuracy"' in content
        assert '"f1"' in content
        assert "self.plot_roc_curve(" in content

    def test_write_workflow_file_regression(self, client, tmp_project):
        resp = client.post("/api/project/workflow-file", json={
            "problem_type": "regression",
            "steps": [
                {"evaluator_id": "fit_model", "method_name": "fit_model", "args": {}},
                {
                    "evaluator_id": "plot_residuals",
                    "method_name": "plot_residuals",
                    "args": {"add_fit_line": True},
                },
            ],
        })
        assert resp.status_code == 200

        wf_path = tmp_project / "workflows" / "regression.py"
        assert wf_path.exists()
        content = wf_path.read_text()
        assert "class Regression(Workflow)" in content
        assert "self.plot_residuals(" in content
        assert "add_fit_line=True" in content

    def test_write_metrics_file_classification(self, client, tmp_project):
        resp = client.post("/api/project/metrics-file", json={
            "problem_type": "classification",
        })
        assert resp.status_code == 200

        content = (tmp_project / "metrics.py").read_text()
        assert "CLASSIFICATION_METRICS" in content
        assert "REGRESSION_METRICS" not in content

    def test_write_metrics_file_regression(self, client, tmp_project):
        resp = client.post("/api/project/metrics-file", json={
            "problem_type": "regression",
        })
        assert resp.status_code == 200

        content = (tmp_project / "metrics.py").read_text()
        assert "REGRESSION_METRICS" in content
        assert "CLASSIFICATION_METRICS" not in content

    def test_write_settings_file(self, client, tmp_project):
        resp = client.post("/api/project/settings-file", json={
            "problem_type": "classification",
            "default_algorithms": ["logistic", "rf"],
            "experiment_groups": [
                {
                    "name": "group1",
                    "description": "First group",
                    "dataset_file_name": "data.csv",
                    "algorithms": ["logistic"],
                },
                {
                    "name": "group2",
                    "description": "",
                    "dataset_file_name": "other.csv",
                    "algorithms": ["logistic", "rf"],
                },
            ],
        })
        assert resp.status_code == 200

        content = (tmp_project / "settings.py").read_text()
        assert 'default_workflow="classification"' in content
        assert '"logistic"' in content
        assert '"rf"' in content
        assert 'name="group1"' in content
        assert 'name="group2"' in content
        assert 'datasets=["data.csv"]' in content
        assert 'datasets=["other.csv"]' in content

    def test_write_evaluators_file(self, client, tmp_project):
        resp = client.post("/api/project/evaluators-file")
        assert resp.status_code == 200
        assert resp.json()["success"] is True

        content = (tmp_project / "evaluators.py").read_text()
        assert "EvaluatorRegistry" in content
        assert "def register_custom_evaluators" in content

    def test_create_project(self, tmp_project, monkeypatch):
        """POST /api/project should create directory structure."""
        monkeypatch.setenv("BRISK_UI_CREATE_MODE", "true")

        app = __import__("brisk_ui.server", fromlist=["create_app"]).create_app(
            project_path=tmp_project,
        )

        from starlette.testclient import TestClient
        with TestClient(app) as c:
            resp = c.post("/api/project", json={
                "project_name": "My New Project",
                "project_path": str(tmp_project),
            })

        assert resp.status_code == 200
        body = resp.json()
        assert body["project_path"] is not None

        created = pathlib.Path(body["project_path"])
        assert created.name == "my-new-project"
        assert (created / ".brisk" / "project.json").exists()

        pj = json.loads((created / ".brisk" / "project.json").read_text())
        assert pj["project_name"] == "My New Project"


# ============================================================================
# Category 3 – Dashboard writes (merge / update behaviour)
# ============================================================================


class TestDashboardWrites:
    """Tests for safe-zone merge, algorithm merge, and config updates."""

    def test_safe_zone_merge_preserves_user_code(self, client, tmp_project):
        """User code above the marker should survive a re-write."""
        client.post("/api/project/data-file", json={
            "base_data_manager": {"test_size": 0.2},
        })

        data_path = tmp_project / "data.py"
        original = data_path.read_text()
        user_code = "# My custom helper\nimport os\n"
        data_path.write_text(user_code + "\n" + original)

        client.post("/api/project/data-file", json={
            "base_data_manager": {"test_size": 0.4},
        })

        updated = data_path.read_text()
        assert "# My custom helper" in updated
        assert "import os" in updated
        assert "test_size = 0.4" in updated
        assert SAFE_ZONE_MARKER in updated
        marker_pos = updated.index(SAFE_ZONE_MARKER)
        assert updated.index("import os") < marker_pos

    def test_algorithm_merge_preserves_unknown_wrappers(self, client, tmp_project):
        """AlgorithmWrappers added outside the UI should persist across writes."""
        client.post("/api/project/algorithms-file", json={
            "wrappers": [{
                "name": "logistic",
                "display_name": "Logistic",
                "class_name": "LogisticRegression",
                "class_module": "sklearn.linear_model",
                "use_defaults": True,
            }],
        })

        alg_path = tmp_project / "algorithms.py"
        existing = alg_path.read_text()
        manual_wrapper = (
            '    AlgorithmWrapper(\n'
            '        name="custom_xgb",\n'
            '        display_name="XGBoost",\n'
            '        algorithm_class=XGBClassifier,\n'
            '    )'
        )
        existing = existing.replace("\n)", f",\n{manual_wrapper}\n)")
        existing = existing.replace(
            "import brisk\n",
            "import brisk\nfrom xgboost import XGBClassifier\n",
        )
        alg_path.write_text(existing)

        client.post("/api/project/algorithms-file", json={
            "wrappers": [{
                "name": "logistic",
                "display_name": "Logistic",
                "class_name": "LogisticRegression",
                "class_module": "sklearn.linear_model",
                "use_defaults": True,
            }],
        })

        merged = alg_path.read_text()
        assert 'name="logistic"' in merged
        assert 'name="custom_xgb"' in merged

    def test_save_datasets_updates_project_json(self, client, tmp_project):
        resp = client.patch("/api/project/datasets", json={
            "datasets": [
                {
                    "id": "iris.csv",
                    "file_name": "iris.csv",
                    "file_type": "csv",
                    "target_feature": "species",
                    "features_count": 4,
                    "observations_count": 150,
                    "features": [
                        {"name": "sepal_length", "data_type": "float", "categorical": False},
                        {"name": "species", "data_type": "str", "categorical": True},
                    ],
                    "preprocessors": [
                        {"type": "scaling", "config": {"method": "standard"}},
                    ],
                }
            ],
            "base_data_manager": {"test_size": 0.3, "n_splits": 5},
        })
        assert resp.status_code == 200
        assert resp.json()["saved_count"] == 1

        pj = json.loads((tmp_project / ".brisk" / "project.json").read_text())
        assert len(pj["datasets"]) == 1
        ds = pj["datasets"][0]
        assert ds["id"] == "iris.csv"
        assert ds["target_feature"] == "species"
        assert ds["features"][1]["categorical"] is True
        assert ds["preprocessors"][0]["type"] == "scaling"
        assert pj["base_data_manager"]["test_size"] == 0.3

    def test_update_project_settings(self, client, tmp_project):
        resp = client.patch("/api/project", json={
            "project_name": "Renamed Project",
            "project_description": "Updated description",
        })
        assert resp.status_code == 200
        body = resp.json()
        assert body["project_name"] == "Renamed Project"
        assert body["project_description"] == "Updated description"

        pj = json.loads((tmp_project / ".brisk" / "project.json").read_text())
        assert pj["project_name"] == "Renamed Project"

    def test_settings_file_with_preprocessors(self, client, tmp_project):
        resp = client.post("/api/project/settings-file", json={
            "problem_type": "classification",
            "default_algorithms": ["logistic"],
            "experiment_groups": [
                {
                    "name": "preproc_group",
                    "dataset_file_name": "data.csv",
                    "algorithms": ["logistic"],
                    "use_default_data_manager": False,
                    "data_config": {
                        "test_size": 0.3,
                        "preprocessors": [
                            {"type": "missing-data", "config": {"strategy": "mean"}},
                            {"type": "scaling", "config": {"method": "standard"}},
                        ],
                    },
                }
            ],
        })
        assert resp.status_code == 200

        content = (tmp_project / "settings.py").read_text()
        assert "MissingDataPreprocessor" in content
        assert "ScalingPreprocessor" in content
        assert "from brisk.data.preprocessing import" in content

    def test_settings_file_with_plot_settings(self, client, tmp_project):
        resp = client.post("/api/project/settings-file", json={
            "problem_type": "classification",
            "default_algorithms": [],
            "experiment_groups": [],
            "plot_settings": {
                "file_format": "svg",
                "dpi": 150,
                "primary_color": "#FF0000",
            },
        })
        assert resp.status_code == 200

        content = (tmp_project / "settings.py").read_text()
        assert "PlotSettings(" in content
        assert 'file_format="svg"' in content
        assert "dpi=150" in content
        assert 'primary_color="#FF0000"' in content
