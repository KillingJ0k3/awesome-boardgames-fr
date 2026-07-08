package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestGenerateReadme(t *testing.T) {
	tmpDir := t.TempDir()
	dataDir := filepath.Join(tmpDir, "data")
	if err := os.MkdirAll(dataDir, 0o755); err != nil {
		t.Fatalf("mkdir data dir: %v", err)
	}

	if err := os.WriteFile(filepath.Join(dataDir, "comparators.yaml"), []byte("- name: Knapix\n  category: comparator-fr\n  url: https://www.knapix.com/\n"), 0o644); err != nil {
		t.Fatalf("write comparators: %v", err)
	}
	if err := os.WriteFile(filepath.Join(dataDir, "vpc.yaml"), []byte("- name: Philibert\n  category: vpc-fr\n  url: https://www.philibert.net/\n"), 0o644); err != nil {
		t.Fatalf("write vpc: %v", err)
	}

	templatePath := filepath.Join(tmpDir, "README.tpl")
	if err := os.WriteFile(templatePath, []byte("# {{ .Title }}\n\n{{ range .Comparators }}- {{ .name }}\n{{ end }}\n"), 0o644); err != nil {
		t.Fatalf("write template: %v", err)
	}

	targetPath := filepath.Join(tmpDir, "README.md")
	if err := generate(templatePath, targetPath, dataDir); err != nil {
		t.Fatalf("generate: %v", err)
	}

	content, err := os.ReadFile(targetPath)
	if err != nil {
		t.Fatalf("read output: %v", err)
	}

	got := string(content)
	if !strings.Contains(got, "# Awesome Boardgames") {
		t.Fatalf("expected title in output, got %q", got)
	}
	if !strings.Contains(got, "- Knapix") {
		t.Fatalf("expected comparator entry in output, got %q", got)
	}
}
