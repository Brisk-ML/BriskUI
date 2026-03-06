"""Category 2: Dashboard file reads + roundtrip (write-then-read) tests."""

import json
import pathlib


# ============================================================================
# Category 2 – Dashboard reads (parse known files into API responses)
# ============================================================================


class TestDashboardReads:
    """Tests that GET endpoints parse known on-disk files correctly."""

    def test_read_project_settings(self, seeded_client, seeded_project):
        resp = seeded_client.get("/api/project")
        assert resp.status_code == 200
        body = resp.json()
        assert body["project_name"] == "seeded-project"
        assert body["project_description"] == "A seeded project for read tests"
        assert body["project_type"] == "classification"
        assert body["project_path"] == str(seeded_project)

    def test_read_stored_datasets(self, seeded_client):
        resp = seeded_client.get("/api/project/datasets")
        assert resp.status_code == 200
        body = resp.json()

        assert len(body["datasets"]) == 1
        ds = body["datasets"][0]
        assert ds["id"] == "data.csv"
        assert ds["file_name"] == "data.csv"
        assert ds["target_feature"] == "target"
        assert ds["features_count"] == 3
        assert ds["observations_count"] == 100

        feature_names = [f["name"] for f in ds["features"]]
        assert "feat_a" in feature_names
        assert "feat_c" in feature_names

        cat_feature = next(f for f in ds["features"] if f["name"] == "feat_c")
        assert cat_feature["categorical"] is True

        assert ds["data_manager"]["test_size"] == 0.3
        assert ds["data_manager"]["n_splits"] == 3

        assert len(ds["preprocessors"]) == 1
        assert ds["preprocessors"][0]["type"] == "scaling"

        assert body["base_data_manager"]["test_size"] == 0.25
        assert body["base_data_manager"]["stratified"] is True

    def test_read_workflow_data(self, seeded_client):
        resp = seeded_client.get("/api/project/workflow-data")
        assert resp.status_code == 200
        body = resp.json()
        assert body["problem_type"] == "classification"

        steps = body["steps"]
        assert len(steps) == 4

        assert steps[0]["method_name"] == "fit_model"
        assert steps[0]["args"].get("X") == "X_train"

        assert steps[1]["method_name"] == "evaluate_model_cv"
        assert "accuracy" in steps[1]["args"]["metrics"]
        assert "recall" in steps[1]["args"]["metrics"]
        assert steps[1]["args"]["cv"] == 5

        assert steps[2]["method_name"] == "plot_roc_curve"

        assert steps[3]["method_name"] == "hyperparameter_tuning"
        assert steps[3]["args"]["method"] == "grid"

    def test_read_experiments_data(self, seeded_client):
        resp = seeded_client.get("/api/project/experiments-data")
        assert resp.status_code == 200
        body = resp.json()

        assert len(body["datasets"]) == 1
        assert body["datasets"][0]["filename"] == "data.csv"

        algos = body["algorithms"]
        assert len(algos) == 2
        algo_names = {a["name"] for a in algos}
        assert algo_names == {"logistic", "rf"}

        rf = next(a for a in algos if a["name"] == "rf")
        assert rf["class_name"] == "RandomForestClassifier"
        assert rf["class_module"] == "sklearn.ensemble"
        assert rf["default_params"]["n_estimators"] == 200
        assert rf["use_defaults"] is False

        groups = body["experiment_groups"]
        assert len(groups) == 1
        assert groups[0]["name"] == "main"
        assert "data.csv" in groups[0]["datasets"]
        assert set(groups[0]["algorithms"]) == {"logistic", "rf"}

    def test_read_project_stats(self, seeded_client):
        resp = seeded_client.get("/api/project/stats")
        assert resp.status_code == 200
        body = resp.json()

        assert body["datasets"] == 1
        assert body["algorithms"] == 2
        assert body["groups"] == 1
        # 1 group * 1 dataset * 2 algorithms = 2 experiments
        assert body["experiments"] == 2
        # self.evaluate_model_cv + self.plot_roc_curve + self.hyperparameter_tuning
        # (self.model.fit is not counted by the self.\w+\( regex)
        assert body["workflow_steps"] == 3

    def test_read_plot_settings(self, seeded_client):
        resp = seeded_client.get("/api/project/plot-settings")
        assert resp.status_code == 200
        body = resp.json()

        assert body["file_format"] == "svg"
        assert body["dpi"] == 150
        assert body["primary_color"] == "#FF0000"
        # Defaults for unset fields
        assert body["transparent"] is False
        assert body["width"] == 10
        assert body["height"] == 8


# ============================================================================
# Roundtrip tests – write via API then read back via API
# ============================================================================


class TestRoundtrip:
    """Write files through POST endpoints, then verify GET endpoints parse them back."""

    def test_workflow_roundtrip(self, client):
        steps_in = [
            {"evaluator_id": "fit_model", "method_name": "fit_model", "args": {}},
            {
                "evaluator_id": "evaluate_model",
                "method_name": "evaluate_model",
                "args": {"metrics": ["MAE", "RMSE"], "filename": "eval"},
            },
            {
                "evaluator_id": "plot_pred_vs_obs",
                "method_name": "plot_pred_vs_obs",
                "args": {"filename": "pred_vs_obs"},
            },
        ]
        write_resp = client.post("/api/project/workflow-file", json={
            "problem_type": "classification",
            "steps": steps_in,
        })
        assert write_resp.status_code == 200

        read_resp = client.get("/api/project/workflow-data")
        assert read_resp.status_code == 200
        steps_out = read_resp.json()["steps"]

        assert len(steps_out) == 3
        assert steps_out[0]["method_name"] == "fit_model"
        assert steps_out[1]["method_name"] == "evaluate_model"
        assert "MAE" in steps_out[1]["args"]["metrics"]
        assert "RMSE" in steps_out[1]["args"]["metrics"]
        assert steps_out[2]["method_name"] == "plot_pred_vs_obs"

    def test_algorithms_roundtrip(self, client):
        wrappers_in = [
            {
                "name": "svr",
                "display_name": "Support Vector Regressor",
                "class_name": "SVR",
                "class_module": "sklearn.svm",
                "default_params": {"C": 1.0, "kernel": "rbf"},
                "search_space": {},
                "use_defaults": False,
            },
        ]
        write_resp = client.post("/api/project/algorithms-file", json={
            "wrappers": wrappers_in,
        })
        assert write_resp.status_code == 200

        read_resp = client.get("/api/project/experiments-data")
        assert read_resp.status_code == 200
        algos = read_resp.json()["algorithms"]

        assert len(algos) == 1
        assert algos[0]["name"] == "svr"
        assert algos[0]["display_name"] == "Support Vector Regressor"
        assert algos[0]["class_name"] == "SVR"
        assert algos[0]["class_module"] == "sklearn.svm"
        assert algos[0]["default_params"]["C"] == 1.0
        assert algos[0]["default_params"]["kernel"] == "rbf"

    def test_settings_roundtrip(self, client):
        settings_in = {
            "problem_type": "classification",
            "default_algorithms": ["logistic"],
            "experiment_groups": [
                {
                    "name": "exp1",
                    "description": "First experiment",
                    "dataset_file_name": "train.csv",
                    "algorithms": ["logistic"],
                }
            ],
            "plot_settings": {
                "file_format": "pdf",
                "dpi": 200,
                "secondary_color": "#123456",
            },
        }
        write_resp = client.post("/api/project/settings-file", json=settings_in)
        assert write_resp.status_code == 200

        groups_resp = client.get("/api/project/experiments-data")
        assert groups_resp.status_code == 200
        groups = groups_resp.json()["experiment_groups"]
        assert len(groups) == 1
        assert groups[0]["name"] == "exp1"
        assert "train.csv" in groups[0]["datasets"]
        assert groups[0]["algorithms"] == ["logistic"]

        plot_resp = client.get("/api/project/plot-settings")
        assert plot_resp.status_code == 200
        ps = plot_resp.json()
        assert ps["file_format"] == "pdf"
        assert ps["dpi"] == 200
        assert ps["secondary_color"] == "#123456"
