"""Edge-case tests: missing files, empty inputs, no-marker merge, preview endpoint."""

import json
import pathlib

SAFE_ZONE_MARKER = "# ---- BRISK UI MANAGED BELOW (do not edit) ----"


# ============================================================================
# Missing / empty file reads – graceful defaults
# ============================================================================


class TestMissingFileReads:
    """GET endpoints should return sensible defaults when files are absent."""

    def test_workflow_data_no_file(self, client):
        """No workflow file on disk -> empty steps list."""
        resp = client.get("/api/project/workflow-data")
        assert resp.status_code == 200
        body = resp.json()
        assert body["steps"] == []
        assert body["problem_type"] == "classification"

    def test_experiments_data_no_files(self, client):
        """No algorithms.py or settings.py -> empty lists."""
        resp = client.get("/api/project/experiments-data")
        assert resp.status_code == 200
        body = resp.json()
        assert body["algorithms"] == []
        assert body["experiment_groups"] == []

    def test_plot_settings_no_file(self, client):
        """No settings.py -> all defaults."""
        resp = client.get("/api/project/plot-settings")
        assert resp.status_code == 200
        body = resp.json()
        assert body["file_format"] == "png"
        assert body["dpi"] == 300
        assert body["width"] == 10
        assert body["height"] == 8
        assert body["transparent"] is False

    def test_stats_no_files(self, client):
        """No project files besides project.json -> all zeros."""
        resp = client.get("/api/project/stats")
        assert resp.status_code == 200
        body = resp.json()
        assert body["groups"] == 0
        assert body["experiments"] == 0
        assert body["algorithms"] == 0
        assert body["workflow_steps"] == 0

    def test_datasets_empty(self, client):
        resp = client.get("/api/project/datasets")
        assert resp.status_code == 200
        body = resp.json()
        assert body["datasets"] == []

    def test_file_content_missing_file(self, client):
        """GET file content for nonexistent file -> exists=False."""
        resp = client.get("/api/project/files/settings.py/content")
        assert resp.status_code == 200
        body = resp.json()
        assert body["exists"] is False
        assert body["content"] == ""


# ============================================================================
# Safe-zone merge edge cases
# ============================================================================


class TestSafeZoneMerge:

    def test_merge_file_without_marker(self, client, tmp_project):
        """Existing file with NO marker -> entire file preserved as user code above new marker."""
        data_path = tmp_project / "data.py"
        data_path.write_text("# user-only content\nimport math\n")

        client.post("/api/project/data-file", json={
            "base_data_manager": {"test_size": 0.5},
        })

        content = data_path.read_text()
        assert "# user-only content" in content
        assert "import math" in content
        assert SAFE_ZONE_MARKER in content
        assert "test_size = 0.5" in content
        marker_pos = content.index(SAFE_ZONE_MARKER)
        assert content.index("import math") < marker_pos

    def test_merge_on_empty_file(self, client, tmp_project):
        """Empty file on disk -> marker + new content, no crash."""
        data_path = tmp_project / "data.py"
        data_path.write_text("")

        client.post("/api/project/data-file", json={
            "base_data_manager": {"test_size": 0.1},
        })

        content = data_path.read_text()
        assert SAFE_ZONE_MARKER in content
        assert "test_size = 0.1" in content

    def test_safe_zone_merge_on_workflow(self, client, tmp_project):
        """Safe-zone merge should also work on workflow files."""
        wf_path = tmp_project / "workflows" / "classification.py"
        wf_path.write_text("# Custom base class helpers\nimport numpy as np\n")

        client.post("/api/project/workflow-file", json={
            "problem_type": "classification",
            "steps": [{"evaluator_id": "fit_model", "method_name": "fit_model", "args": {}}],
        })

        content = wf_path.read_text()
        assert "import numpy as np" in content
        assert SAFE_ZONE_MARKER in content
        assert "self.model.fit(X_train, y_train)" in content
        marker_pos = content.index(SAFE_ZONE_MARKER)
        assert content.index("import numpy as np") < marker_pos

    def test_safe_zone_merge_on_settings(self, client, tmp_project):
        """Safe-zone merge on settings.py."""
        settings_path = tmp_project / "settings.py"
        settings_path.write_text("# My custom configuration utilities\nimport os\n")

        client.post("/api/project/settings-file", json={
            "problem_type": "classification",
            "default_algorithms": [],
            "experiment_groups": [],
        })

        content = settings_path.read_text()
        assert "# My custom configuration utilities" in content
        assert "import os" in content
        assert SAFE_ZONE_MARKER in content
        assert "Configuration(" in content

    def test_safe_zone_merge_on_metrics(self, client, tmp_project):
        metrics_path = tmp_project / "metrics.py"
        metrics_path.write_text("# Custom metric\ndef my_metric(): pass\n")

        client.post("/api/project/metrics-file", json={"problem_type": "classification"})

        content = metrics_path.read_text()
        assert "def my_metric(): pass" in content
        assert SAFE_ZONE_MARKER in content
        assert "CLASSIFICATION_METRICS" in content


# ============================================================================
# Preview endpoint
# ============================================================================


class TestPreviewFiles:
    """POST /project/preview-files generates content without writing to disk."""

    def test_preview_generates_content(self, client, tmp_project):
        resp = client.post("/api/project/preview-files", json={
            "data_file": {"base_data_manager": {"test_size": 0.3}},
            "metrics_file": {"problem_type": "classification"},
            "workflow_file": {
                "problem_type": "classification",
                "steps": [{"evaluator_id": "fit_model", "method_name": "fit_model", "args": {}}],
            },
        })
        assert resp.status_code == 200
        files = resp.json()["files"]
        assert "data.py" in files
        assert "test_size = 0.3" in files["data.py"]
        assert "metrics.py" in files
        assert "CLASSIFICATION_METRICS" in files["metrics.py"]
        assert "workflows/classification.py" in files
        assert "self.model.fit" in files["workflows/classification.py"]

    def test_preview_does_not_write_to_disk(self, client, tmp_project):
        """Preview should not create files."""
        client.post("/api/project/preview-files", json={
            "data_file": {"base_data_manager": {"test_size": 0.3}},
        })
        assert not (tmp_project / "data.py").exists()

    def test_preview_falls_back_to_disk(self, seeded_client, seeded_project):
        """When no config provided for a file type, returns the on-disk content."""
        resp = seeded_client.post("/api/project/preview-files", json={})
        assert resp.status_code == 200
        files = resp.json()["files"]
        assert "data.py" in files
        assert "test_size = 0.25" in files["data.py"]
        assert "algorithms.py" in files
        assert "settings.py" in files

    def test_preview_merges_with_existing(self, seeded_client, seeded_project):
        """Preview should apply safe-zone merge with existing files."""
        resp = seeded_client.post("/api/project/preview-files", json={
            "data_file": {"base_data_manager": {"test_size": 0.99}},
        })
        assert resp.status_code == 200
        data_content = resp.json()["files"]["data.py"]
        assert "test_size = 0.99" in data_content
        assert SAFE_ZONE_MARKER in data_content


# ============================================================================
# File list and content endpoints
# ============================================================================


class TestFileEndpoints:

    def test_files_list(self, seeded_client):
        resp = seeded_client.get("/api/project/files")
        assert resp.status_code == 200
        body = resp.json()
        file_names = {f["name"] for f in body["files"]}
        assert "settings.py" in file_names
        assert "algorithms.py" in file_names
        assert "data.py" in file_names
        assert "metrics.py" in file_names
        assert "classification.py" in file_names
        assert body["project_type"] == "classification"

    def test_file_content_existing(self, seeded_client):
        resp = seeded_client.get("/api/project/files/data.py/content")
        assert resp.status_code == 200
        body = resp.json()
        assert body["exists"] is True
        assert "DataManager" in body["content"]

    def test_workflow_file_content(self, seeded_client):
        resp = seeded_client.get("/api/project/files/workflow/content")
        assert resp.status_code == 200
        body = resp.json()
        assert body["exists"] is True
        assert "class Classification" in body["content"]


# ============================================================================
# Data file: group_column parameter
# ============================================================================


class TestDataFileGroupColumn:

    def test_group_column_written(self, client, tmp_project):
        client.post("/api/project/data-file", json={
            "base_data_manager": {
                "test_size": 0.2,
                "group_column": "patient_id",
            },
        })
        content = (tmp_project / "data.py").read_text()
        assert 'group_column = "patient_id"' in content
