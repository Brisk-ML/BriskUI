"""Exhaustive write + roundtrip tests for every workflow step method.

Each method in _format_workflow_step_call has its own arg-handling logic,
int() conversions, and output patterns. We test every one.
"""

import pytest

SAFE_ZONE_MARKER = "# ---- BRISK UI MANAGED BELOW (do not edit) ----"


def _write_and_read(client, steps, problem_type="classification"):
    """Helper: write workflow then read it back.

    The GET /workflow-data endpoint reads project_type from project.json to
    determine which workflow file to parse. If writing a regression workflow,
    update project.json first so the read endpoint finds the right file.
    """
    if problem_type != "classification":
        client.patch("/api/project", json={"project_type": problem_type})
    write = client.post("/api/project/workflow-file", json={
        "problem_type": problem_type,
        "steps": steps,
    })
    assert write.status_code == 200
    read = client.get("/api/project/workflow-data")
    assert read.status_code == 200
    return read.json()["steps"]


class TestWorkflowMethodWrites:
    """Verify the generated Python code for every workflow method."""

    def test_fit_model_default_data(self, client, tmp_project):
        client.post("/api/project/workflow-file", json={
            "problem_type": "classification",
            "steps": [{"evaluator_id": "fit_model", "method_name": "fit_model", "args": {}}],
        })
        content = (tmp_project / "workflows" / "classification.py").read_text()
        assert "self.model.fit(X_train, y_train)" in content

    def test_fit_model_test_data(self, client, tmp_project):
        client.post("/api/project/workflow-file", json={
            "problem_type": "classification",
            "steps": [{"evaluator_id": "fit_model", "method_name": "fit_model",
                        "args": {"X": "X_test", "y": "y_test"}}],
        })
        content = (tmp_project / "workflows" / "classification.py").read_text()
        assert "self.model.fit(X_test, y_test)" in content

    def test_evaluate_model(self, client, tmp_project):
        client.post("/api/project/workflow-file", json={
            "problem_type": "regression",
            "steps": [{
                "evaluator_id": "evaluate_model",
                "method_name": "evaluate_model",
                "args": {"metrics": ["MAE", "RMSE"], "filename": "eval_test", "X": "X_test", "y": "y_test"},
            }],
        })
        content = (tmp_project / "workflows" / "regression.py").read_text()
        assert "self.evaluate_model(self.model, X_test, y_test" in content
        assert '"MAE"' in content
        assert '"RMSE"' in content
        assert '"eval_test"' in content

    def test_evaluate_model_cv(self, client, tmp_project):
        client.post("/api/project/workflow-file", json={
            "problem_type": "classification",
            "steps": [{
                "evaluator_id": "evaluate_model_cv",
                "method_name": "evaluate_model_cv",
                "args": {"metrics": ["accuracy", "f1"], "cv": 10, "filename": "cv_out"},
            }],
        })
        content = (tmp_project / "workflows" / "classification.py").read_text()
        assert "self.evaluate_model_cv(self.model, X_train, y_train" in content
        assert '"accuracy"' in content
        assert '"f1"' in content
        assert "cv=10" in content
        assert '"cv_out"' in content

    def test_plot_pred_vs_obs(self, client, tmp_project):
        client.post("/api/project/workflow-file", json={
            "problem_type": "regression",
            "steps": [{
                "evaluator_id": "plot_pred_vs_obs",
                "method_name": "plot_pred_vs_obs",
                "args": {"filename": "pvo", "X": "X_train", "y": "y_train"},
            }],
        })
        content = (tmp_project / "workflows" / "regression.py").read_text()
        assert "self.plot_pred_vs_obs(self.model, X_train, y_train" in content
        assert '"pvo"' in content

    def test_plot_learning_curve(self, client, tmp_project):
        client.post("/api/project/workflow-file", json={
            "problem_type": "regression",
            "steps": [{
                "evaluator_id": "plot_learning_curve",
                "method_name": "plot_learning_curve",
                "args": {
                    "filename": "lc", "cv": 3, "num_repeats": 2,
                    "n_jobs": 4, "metric": "neg_mean_squared_error",
                },
            }],
        })
        content = (tmp_project / "workflows" / "regression.py").read_text()
        assert "self.plot_learning_curve(self.model, X_train, y_train" in content
        assert 'filename="lc"' in content
        assert "cv=3" in content
        assert "num_repeats=2" in content
        assert "n_jobs=4" in content
        assert 'metric="neg_mean_squared_error"' in content

    def test_plot_feature_importance(self, client, tmp_project):
        client.post("/api/project/workflow-file", json={
            "problem_type": "regression",
            "steps": [{
                "evaluator_id": "plot_feature_importance",
                "method_name": "plot_feature_importance",
                "args": {
                    "threshold": 15, "filename": "fi",
                    "metric": "neg_mean_absolute_error", "num_rep": 8,
                },
            }],
        })
        content = (tmp_project / "workflows" / "regression.py").read_text()
        assert "self.plot_feature_importance(self.model, X_train, y_train, 15, feature_names" in content
        assert '"fi"' in content
        assert 'metric="neg_mean_absolute_error"' in content
        assert "num_rep=8)" in content

    def test_plot_residuals(self, client, tmp_project):
        client.post("/api/project/workflow-file", json={
            "problem_type": "regression",
            "steps": [{
                "evaluator_id": "plot_residuals",
                "method_name": "plot_residuals",
                "args": {"filename": "res", "add_fit_line": True},
            }],
        })
        content = (tmp_project / "workflows" / "regression.py").read_text()
        assert "self.plot_residuals(self.model, X_test, y_test" in content
        assert '"res"' in content
        assert "add_fit_line=True" in content

    def test_plot_residuals_no_fit_line(self, client, tmp_project):
        client.post("/api/project/workflow-file", json={
            "problem_type": "regression",
            "steps": [{
                "evaluator_id": "plot_residuals",
                "method_name": "plot_residuals",
                "args": {"add_fit_line": False},
            }],
        })
        content = (tmp_project / "workflows" / "regression.py").read_text()
        assert "add_fit_line=False" in content

    def test_hyperparameter_tuning(self, client, tmp_project):
        client.post("/api/project/workflow-file", json={
            "problem_type": "classification",
            "steps": [{
                "evaluator_id": "hyperparameter_tuning",
                "method_name": "hyperparameter_tuning",
                "args": {
                    "method": "random", "scorer": "f1_score",
                    "kf": 3, "num_rep": 5, "n_jobs": 2, "plot_results": True,
                },
            }],
        })
        content = (tmp_project / "workflows" / "classification.py").read_text()
        assert 'self.model = self.hyperparameter_tuning(self.model, "random", X_train, y_train' in content
        assert '"f1_score"' in content
        assert ", 3, 5, 2," in content
        assert "plot_results=True" in content

    def test_confusion_matrix(self, client, tmp_project):
        """Uses .values on X/y — distinct from other methods."""
        client.post("/api/project/workflow-file", json={
            "problem_type": "classification",
            "steps": [{
                "evaluator_id": "confusion_matrix",
                "method_name": "confusion_matrix",
                "args": {"filename": "cm"},
            }],
        })
        content = (tmp_project / "workflows" / "classification.py").read_text()
        assert "self.confusion_matrix(self.model, X_test.values, y_test.values" in content
        assert '"cm"' in content

    def test_plot_confusion_heatmap(self, client, tmp_project):
        """Uses .values on X/y — distinct from other methods."""
        client.post("/api/project/workflow-file", json={
            "problem_type": "classification",
            "steps": [{
                "evaluator_id": "plot_confusion_heatmap",
                "method_name": "plot_confusion_heatmap",
                "args": {"filename": "ch"},
            }],
        })
        content = (tmp_project / "workflows" / "classification.py").read_text()
        assert "self.plot_confusion_heatmap(self.model, X_test.values, y_test.values" in content
        assert '"ch"' in content

    def test_plot_roc_curve(self, client, tmp_project):
        client.post("/api/project/workflow-file", json={
            "problem_type": "classification",
            "steps": [{
                "evaluator_id": "plot_roc_curve",
                "method_name": "plot_roc_curve",
                "args": {"pos_label": 2, "filename": "roc"},
            }],
        })
        content = (tmp_project / "workflows" / "classification.py").read_text()
        assert "self.plot_roc_curve(self.model, X_test.values, y_test.values" in content
        assert '"roc"' in content
        assert "pos_label=2" in content

    def test_plot_precision_recall_curve(self, client, tmp_project):
        client.post("/api/project/workflow-file", json={
            "problem_type": "classification",
            "steps": [{
                "evaluator_id": "plot_precision_recall_curve",
                "method_name": "plot_precision_recall_curve",
                "args": {"pos_label": 0, "filename": "prc"},
            }],
        })
        content = (tmp_project / "workflows" / "classification.py").read_text()
        assert "self.plot_precision_recall_curve(self.model, X_test.values, y_test.values" in content
        assert '"prc"' in content
        assert "pos_label=0" in content

    def test_plot_shapley_values(self, client, tmp_project):
        client.post("/api/project/workflow-file", json={
            "problem_type": "regression",
            "steps": [{
                "evaluator_id": "plot_shapley_values",
                "method_name": "plot_shapley_values",
                "args": {"filename": "shap", "plot_type": "waterfall"},
            }],
        })
        content = (tmp_project / "workflows" / "regression.py").read_text()
        assert "self.plot_shapley_values(self.model, X_test, y_test" in content
        assert 'filename="shap"' in content
        assert 'plot_type="waterfall"' in content

    def test_save_model(self, client, tmp_project):
        client.post("/api/project/workflow-file", json={
            "problem_type": "classification",
            "steps": [{
                "evaluator_id": "save_model",
                "method_name": "save_model",
                "args": {"filename": "best_model"},
            }],
        })
        content = (tmp_project / "workflows" / "classification.py").read_text()
        assert 'self.save_model(self.model, "best_model")' in content

    def test_empty_steps_generates_pass(self, client, tmp_project):
        client.post("/api/project/workflow-file", json={
            "problem_type": "classification",
            "steps": [],
        })
        content = (tmp_project / "workflows" / "classification.py").read_text()
        assert "        pass" in content


class TestWorkflowMethodRoundtrips:
    """Write each workflow method via API, then read back and check parsing."""

    def test_fit_model_roundtrip(self, client):
        steps = _write_and_read(client, [
            {"evaluator_id": "fit_model", "method_name": "fit_model", "args": {"X": "X_train", "y": "y_train"}},
        ])
        assert len(steps) == 1
        assert steps[0]["method_name"] == "fit_model"
        assert steps[0]["args"]["X"] == "X_train"
        assert steps[0]["args"]["y"] == "y_train"

    def test_evaluate_model_roundtrip(self, client):
        steps = _write_and_read(client, [{
            "evaluator_id": "evaluate_model",
            "method_name": "evaluate_model",
            "args": {"metrics": ["MAE", "RMSE"], "filename": "eval_out"},
        }])
        assert steps[0]["method_name"] == "evaluate_model"
        assert "MAE" in steps[0]["args"]["metrics"]
        assert "RMSE" in steps[0]["args"]["metrics"]
        assert steps[0]["args"]["filename"] == "eval_out"

    def test_evaluate_model_cv_roundtrip(self, client):
        steps = _write_and_read(client, [{
            "evaluator_id": "evaluate_model_cv",
            "method_name": "evaluate_model_cv",
            "args": {"metrics": ["accuracy"], "cv": 10, "filename": "cv10"},
        }])
        assert steps[0]["method_name"] == "evaluate_model_cv"
        assert "accuracy" in steps[0]["args"]["metrics"]
        assert steps[0]["args"]["cv"] == 10

    def test_plot_learning_curve_roundtrip(self, client):
        steps = _write_and_read(client, [{
            "evaluator_id": "plot_learning_curve",
            "method_name": "plot_learning_curve",
            "args": {"cv": 3, "num_repeats": 2, "n_jobs": 4, "metric": "r2"},
        }], problem_type="regression")
        s = steps[0]
        assert s["method_name"] == "plot_learning_curve"
        assert s["args"]["cv"] == 3
        assert s["args"]["num_repeats"] == 2
        assert s["args"]["n_jobs"] == 4
        assert s["args"]["metric"] == "r2"

    def test_plot_feature_importance_roundtrip(self, client):
        steps = _write_and_read(client, [{
            "evaluator_id": "plot_feature_importance",
            "method_name": "plot_feature_importance",
            "args": {"threshold": 20, "metric": "neg_mean_absolute_error", "num_rep": 8},
        }], problem_type="regression")
        s = steps[0]
        assert s["method_name"] == "plot_feature_importance"
        assert s["args"]["metric"] == "neg_mean_absolute_error"
        assert s["args"]["num_rep"] == 8

    def test_plot_residuals_roundtrip(self, client):
        steps = _write_and_read(client, [{
            "evaluator_id": "plot_residuals",
            "method_name": "plot_residuals",
            "args": {"add_fit_line": True, "filename": "res"},
        }], problem_type="regression")
        assert steps[0]["method_name"] == "plot_residuals"
        assert steps[0]["args"]["add_fit_line"] is True

    def test_hyperparameter_tuning_roundtrip(self, client):
        steps = _write_and_read(client, [{
            "evaluator_id": "hyperparameter_tuning",
            "method_name": "hyperparameter_tuning",
            "args": {"method": "random", "scorer": "f1_score", "kf": 3, "plot_results": True},
        }])
        s = steps[0]
        assert s["method_name"] == "hyperparameter_tuning"
        assert s["args"]["method"] == "random"
        assert s["args"]["plot_results"] is True

    def test_confusion_matrix_roundtrip(self, client):
        steps = _write_and_read(client, [{
            "evaluator_id": "confusion_matrix",
            "method_name": "confusion_matrix",
            "args": {"filename": "cm"},
        }])
        assert steps[0]["method_name"] == "confusion_matrix"
        assert steps[0]["args"]["filename"] == "cm"

    def test_plot_confusion_heatmap_roundtrip(self, client):
        steps = _write_and_read(client, [{
            "evaluator_id": "plot_confusion_heatmap",
            "method_name": "plot_confusion_heatmap",
            "args": {"filename": "ch"},
        }])
        assert steps[0]["method_name"] == "plot_confusion_heatmap"
        assert steps[0]["args"]["filename"] == "ch"

    def test_plot_roc_curve_roundtrip(self, client):
        steps = _write_and_read(client, [{
            "evaluator_id": "plot_roc_curve",
            "method_name": "plot_roc_curve",
            "args": {"pos_label": 1, "filename": "roc"},
        }])
        assert steps[0]["method_name"] == "plot_roc_curve"

    def test_plot_precision_recall_curve_roundtrip(self, client):
        steps = _write_and_read(client, [{
            "evaluator_id": "plot_precision_recall_curve",
            "method_name": "plot_precision_recall_curve",
            "args": {"pos_label": 0, "filename": "prc"},
        }])
        assert steps[0]["method_name"] == "plot_precision_recall_curve"

    def test_plot_shapley_values_roundtrip(self, client):
        steps = _write_and_read(client, [{
            "evaluator_id": "plot_shapley_values",
            "method_name": "plot_shapley_values",
            "args": {"plot_type": "violin", "filename": "shap"},
        }], problem_type="regression")
        assert steps[0]["method_name"] == "plot_shapley_values"

    def test_save_model_roundtrip(self, client):
        steps = _write_and_read(client, [{
            "evaluator_id": "save_model",
            "method_name": "save_model",
            "args": {"filename": "best"},
        }])
        assert steps[0]["method_name"] == "save_model"
        assert steps[0]["args"]["filename"] == "best"

    def test_all_methods_combined_roundtrip(self, client):
        """Write every method type at once, verify they all survive the roundtrip."""
        all_steps = [
            {"evaluator_id": "fit_model", "method_name": "fit_model", "args": {}},
            {"evaluator_id": "evaluate_model", "method_name": "evaluate_model",
             "args": {"metrics": ["MAE"], "filename": "em"}},
            {"evaluator_id": "evaluate_model_cv", "method_name": "evaluate_model_cv",
             "args": {"metrics": ["accuracy"], "cv": 5, "filename": "ecv"}},
            {"evaluator_id": "plot_learning_curve", "method_name": "plot_learning_curve",
             "args": {"cv": 3, "filename": "lc"}},
            {"evaluator_id": "plot_feature_importance", "method_name": "plot_feature_importance",
             "args": {"threshold": 10, "filename": "fi"}},
            {"evaluator_id": "hyperparameter_tuning", "method_name": "hyperparameter_tuning",
             "args": {"method": "grid", "scorer": "f1_score"}},
            {"evaluator_id": "confusion_matrix", "method_name": "confusion_matrix",
             "args": {"filename": "cm"}},
            {"evaluator_id": "plot_confusion_heatmap", "method_name": "plot_confusion_heatmap",
             "args": {"filename": "ch"}},
            {"evaluator_id": "plot_roc_curve", "method_name": "plot_roc_curve",
             "args": {"pos_label": 1, "filename": "roc"}},
            {"evaluator_id": "plot_precision_recall_curve", "method_name": "plot_precision_recall_curve",
             "args": {"pos_label": 1, "filename": "prc"}},
            {"evaluator_id": "plot_shapley_values", "method_name": "plot_shapley_values",
             "args": {"plot_type": "bar", "filename": "shap"}},
            {"evaluator_id": "save_model", "method_name": "save_model",
             "args": {"filename": "model"}},
        ]
        steps_out = _write_and_read(client, all_steps)
        methods_out = [s["method_name"] for s in steps_out]
        assert "fit_model" in methods_out
        assert "evaluate_model" in methods_out
        assert "evaluate_model_cv" in methods_out
        assert "plot_learning_curve" in methods_out
        assert "plot_feature_importance" in methods_out
        assert "hyperparameter_tuning" in methods_out
        assert "confusion_matrix" in methods_out
        assert "plot_confusion_heatmap" in methods_out
        assert "plot_roc_curve" in methods_out
        assert "plot_precision_recall_curve" in methods_out
        assert "plot_shapley_values" in methods_out
        assert "save_model" in methods_out
        assert len(steps_out) == 12
