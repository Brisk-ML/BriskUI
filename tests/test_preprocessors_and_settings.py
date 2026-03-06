"""Tests for all preprocessor types/strategies and settings.py generation options."""

import pytest

SAFE_ZONE_MARKER = "# ---- BRISK UI MANAGED BELOW (do not edit) ----"


def _write_settings_with_preprocessors(client, preprocessors, problem_type="classification"):
    """Helper: write a settings file with one experiment group that has preprocessors."""
    resp = client.post("/api/project/settings-file", json={
        "problem_type": problem_type,
        "default_algorithms": ["alg1"],
        "experiment_groups": [{
            "name": "g1",
            "dataset_file_name": "data.csv",
            "algorithms": ["alg1"],
            "use_default_data_manager": False,
            "data_config": {
                "test_size": 0.2,
                "preprocessors": preprocessors,
            },
        }],
    })
    assert resp.status_code == 200
    return resp


# ============================================================================
# Preprocessor types and strategy combinations
# ============================================================================


class TestPreprocessorMissingData:
    """All missing-data strategy branches."""

    def test_missing_data_mean(self, client, tmp_project):
        _write_settings_with_preprocessors(client, [
            {"type": "missing-data", "config": {"strategy": "mean"}},
        ])
        content = (tmp_project / "settings.py").read_text()
        assert 'MissingDataPreprocessor(strategy="impute", impute_method="mean")' in content

    def test_missing_data_median(self, client, tmp_project):
        _write_settings_with_preprocessors(client, [
            {"type": "missing-data", "config": {"strategy": "median"}},
        ])
        content = (tmp_project / "settings.py").read_text()
        assert 'MissingDataPreprocessor(strategy="impute", impute_method="median")' in content

    def test_missing_data_most_frequent_maps_to_mode(self, client, tmp_project):
        _write_settings_with_preprocessors(client, [
            {"type": "missing-data", "config": {"strategy": "most_frequent"}},
        ])
        content = (tmp_project / "settings.py").read_text()
        assert 'impute_method="mode"' in content
        assert "most_frequent" not in content

    def test_missing_data_drop(self, client, tmp_project):
        _write_settings_with_preprocessors(client, [
            {"type": "missing-data", "config": {"strategy": "drop"}},
        ])
        content = (tmp_project / "settings.py").read_text()
        assert 'MissingDataPreprocessor(strategy="drop_rows")' in content

    def test_missing_data_constant_numeric(self, client, tmp_project):
        _write_settings_with_preprocessors(client, [
            {"type": "missing-data", "config": {"strategy": "constant", "fillValue": "99"}},
        ])
        content = (tmp_project / "settings.py").read_text()
        assert 'impute_method="constant"' in content
        assert "constant_value=99" in content

    def test_missing_data_constant_string(self, client, tmp_project):
        _write_settings_with_preprocessors(client, [
            {"type": "missing-data", "config": {"strategy": "constant", "fillValue": "MISSING"}},
        ])
        content = (tmp_project / "settings.py").read_text()
        assert 'impute_method="constant"' in content
        assert 'constant_value="MISSING"' in content


class TestPreprocessorScaling:

    def test_scaling_standard(self, client, tmp_project):
        _write_settings_with_preprocessors(client, [
            {"type": "scaling", "config": {"method": "standard"}},
        ])
        content = (tmp_project / "settings.py").read_text()
        assert 'ScalingPreprocessor(method="standard")' in content

    def test_scaling_minmax(self, client, tmp_project):
        _write_settings_with_preprocessors(client, [
            {"type": "scaling", "config": {"method": "minmax"}},
        ])
        content = (tmp_project / "settings.py").read_text()
        assert 'ScalingPreprocessor(method="minmax")' in content


class TestPreprocessorEncoding:

    def test_encoding_label(self, client, tmp_project):
        _write_settings_with_preprocessors(client, [
            {"type": "encoding", "config": {"method": "label"}},
        ])
        content = (tmp_project / "settings.py").read_text()
        assert 'CategoricalEncodingPreprocessor(method="label")' in content

    def test_encoding_onehot(self, client, tmp_project):
        _write_settings_with_preprocessors(client, [
            {"type": "encoding", "config": {"method": "onehot"}},
        ])
        content = (tmp_project / "settings.py").read_text()
        assert 'CategoricalEncodingPreprocessor(method="onehot")' in content

    def test_encoding_target_maps_to_label(self, client, tmp_project):
        _write_settings_with_preprocessors(client, [
            {"type": "encoding", "config": {"method": "target"}},
        ])
        content = (tmp_project / "settings.py").read_text()
        assert 'CategoricalEncodingPreprocessor(method="label")' in content


class TestPreprocessorFeatureSelection:

    def test_feature_selection_variance(self, client, tmp_project):
        _write_settings_with_preprocessors(client, [
            {"type": "feature-selection", "config": {"method": "variance", "nFeatures": 8}},
        ])
        content = (tmp_project / "settings.py").read_text()
        assert 'FeatureSelectionPreprocessor(method="selectkbest"' in content
        assert "n_features_to_select=8" in content

    def test_feature_selection_recursive(self, client, tmp_project):
        _write_settings_with_preprocessors(client, [
            {"type": "feature-selection", "config": {"method": "recursive", "nFeatures": 5}},
        ])
        content = (tmp_project / "settings.py").read_text()
        assert 'method="rfecv"' in content
        assert "n_features_to_select=5" in content

    def test_feature_selection_lasso(self, client, tmp_project):
        _write_settings_with_preprocessors(client, [
            {"type": "feature-selection", "config": {"method": "lasso", "nFeatures": 3}},
        ])
        content = (tmp_project / "settings.py").read_text()
        assert 'method="sequential"' in content
        assert "n_features_to_select=3" in content

    def test_feature_selection_auto_nfeatures(self, client, tmp_project):
        """nFeatures="auto" should default to 5."""
        _write_settings_with_preprocessors(client, [
            {"type": "feature-selection", "config": {"method": "variance", "nFeatures": "auto"}},
        ])
        content = (tmp_project / "settings.py").read_text()
        assert "n_features_to_select=5" in content

    def test_feature_selection_problem_type_propagated(self, client, tmp_project):
        _write_settings_with_preprocessors(client, [
            {"type": "feature-selection", "config": {"method": "variance"}},
        ], problem_type="regression")
        content = (tmp_project / "settings.py").read_text()
        assert 'problem_type="regression"' in content


class TestPreprocessorOrdering:
    """Brisk pipeline order: missing-data -> encoding -> scaling -> feature-selection."""

    def test_preprocessors_ordered_correctly(self, client, tmp_project):
        """Inside data_config, preprocessors should follow pipeline order
        regardless of the order they were provided in the request."""
        _write_settings_with_preprocessors(client, [
            {"type": "feature-selection", "config": {"method": "variance"}},
            {"type": "scaling", "config": {"method": "standard"}},
            {"type": "missing-data", "config": {"strategy": "mean"}},
            {"type": "encoding", "config": {"method": "label"}},
        ])
        content = (tmp_project / "settings.py").read_text()
        # Look within the data_config block, not the import block
        dc_start = content.index("data_config=")
        dc_section = content[dc_start:]
        md_pos = dc_section.index("MissingDataPreprocessor")
        enc_pos = dc_section.index("CategoricalEncodingPreprocessor")
        sc_pos = dc_section.index("ScalingPreprocessor")
        fs_pos = dc_section.index("FeatureSelectionPreprocessor")
        assert md_pos < enc_pos < sc_pos < fs_pos


# ============================================================================
# Settings file: untested options
# ============================================================================


class TestSettingsOptions:

    def test_categorical_features(self, client, tmp_project):
        resp = client.post("/api/project/settings-file", json={
            "problem_type": "classification",
            "default_algorithms": ["logistic"],
            "experiment_groups": [{
                "name": "g1",
                "dataset_file_name": "data.csv",
                "algorithms": ["logistic"],
            }],
            "categorical_features": [
                {
                    "dataset_file_name": "data.csv",
                    "features": ["color", "size"],
                },
            ],
        })
        assert resp.status_code == 200
        content = (tmp_project / "settings.py").read_text()
        assert "categorical_features=" in content
        assert '"color"' in content
        assert '"size"' in content
        assert '"data.csv"' in content

    def test_categorical_features_sqlite_tuple(self, client, tmp_project):
        resp = client.post("/api/project/settings-file", json={
            "problem_type": "classification",
            "default_algorithms": [],
            "experiment_groups": [{
                "name": "g1",
                "dataset_file_name": "db.sqlite",
                "dataset_table_name": "measurements",
                "algorithms": ["logistic"],
            }],
            "categorical_features": [
                {
                    "dataset_file_name": "db.sqlite",
                    "table_name": "measurements",
                    "features": ["category"],
                },
            ],
        })
        assert resp.status_code == 200
        content = (tmp_project / "settings.py").read_text()
        assert 'datasets=[("db.sqlite", "measurements")]' in content
        assert '("db.sqlite", "measurements")' in content
        assert '"category"' in content

    def test_dataset_table_name_sqlite_format(self, client, tmp_project):
        """Experiment group with dataset_table_name should produce tuple datasets."""
        resp = client.post("/api/project/settings-file", json={
            "problem_type": "regression",
            "default_algorithms": ["rf"],
            "experiment_groups": [{
                "name": "sqlite_group",
                "dataset_file_name": "mydata.sqlite",
                "dataset_table_name": "train_data",
                "algorithms": ["rf"],
            }],
        })
        assert resp.status_code == 200
        content = (tmp_project / "settings.py").read_text()
        assert 'datasets=[("mydata.sqlite", "train_data")]' in content

    def test_full_data_config(self, client, tmp_project):
        """Experiment group with all data_config parameters."""
        resp = client.post("/api/project/settings-file", json={
            "problem_type": "classification",
            "default_algorithms": ["logistic"],
            "experiment_groups": [{
                "name": "full_dc",
                "dataset_file_name": "data.csv",
                "algorithms": ["logistic"],
                "use_default_data_manager": False,
                "data_config": {
                    "test_size": 0.3,
                    "n_splits": 10,
                    "split_method": "kfold",
                    "group_column": "fold_id",
                    "stratified": True,
                    "random_state": 42,
                },
            }],
        })
        assert resp.status_code == 200
        content = (tmp_project / "settings.py").read_text()
        assert '"test_size": 0.3' in content
        assert '"n_splits": 10' in content
        assert '"split_method": "kfold"' in content
        assert '"group_column": "fold_id"' in content
        assert '"stratified": True' in content
        assert '"random_state": 42' in content

    def test_default_plot_settings_omits_block(self, client, tmp_project):
        """When all plot settings are defaults, no PlotSettings block should appear."""
        resp = client.post("/api/project/settings-file", json={
            "problem_type": "classification",
            "default_algorithms": [],
            "experiment_groups": [],
            "plot_settings": {
                "file_format": "png",
                "dpi": 300,
                "primary_color": "#1175D5",
                "secondary_color": "#00A878",
                "accent_color": "#DE6B48",
                "width": 10,
                "height": 8,
                "transparent": False,
            },
        })
        assert resp.status_code == 200
        content = (tmp_project / "settings.py").read_text()
        assert "PlotSettings" not in content

    def test_all_plot_settings_non_default(self, client, tmp_project):
        resp = client.post("/api/project/settings-file", json={
            "problem_type": "classification",
            "default_algorithms": [],
            "experiment_groups": [],
            "plot_settings": {
                "file_format": "svg",
                "dpi": 150,
                "primary_color": "#FF0000",
                "secondary_color": "#00FF00",
                "accent_color": "#0000FF",
                "width": 12,
                "height": 6,
                "transparent": True,
            },
        })
        assert resp.status_code == 200
        content = (tmp_project / "settings.py").read_text()
        assert "PlotSettings(" in content
        assert 'file_format="svg"' in content
        assert "dpi=150" in content
        assert 'primary_color="#FF0000"' in content
        assert 'secondary_color="#00FF00"' in content
        assert 'accent_color="#0000FF"' in content
        assert "width=12" in content
        assert "height=6" in content
        assert "transparent=True" in content
