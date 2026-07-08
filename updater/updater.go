package main

import (
	"fmt"
	"os"
	"path/filepath"
	"slices"
	"sort"
	"strings"
	"text/template"

	"gopkg.in/yaml.v3"
)

func main() {
	dataDirectory := "./data/"
	templateFile := "template/README.tpl"
	targetFile := "./README.md"

	if err := generate(templateFile, targetFile, dataDirectory); err != nil {
		fmt.Fprintf(os.Stderr, "updater: %v\n", err)
		os.Exit(1)
	}
}

func filter(sites []map[string]any, countries []string) []map[string]any {
	results := make([]map[string]any, 0)
	for _, value := range sites {
		s, _ := value["country"].(string)
		if slices.Contains(countries, s) {
			results = append(results, value)
		}
	}
	return results
}

func generate(templateFile, targetFile, dataDirectory string) error {
	data, err := readYAMLData(dataDirectory)
	if err != nil {
		return err
	}

	tpl, err := template.ParseFiles(templateFile)
	if err != nil {
		return fmt.Errorf("parse template %q: %w", templateFile, err)
	}

	outputFile, err := os.Create(targetFile)
	if err != nil {
		return fmt.Errorf("create target file %q: %w", targetFile, err)
	}
	defer outputFile.Close()

	context := struct {
		Title             string
		Comparators       []map[string]any
		Comparators_FR    []map[string]any
		Comparators_WORLD []map[string]any
		Editors           []map[string]any
		General           []map[string]any
		VPC               []map[string]any
		VPC_FR            []map[string]any
		VPC_DE            []map[string]any
		VPC_BE            []map[string]any
		VPC_WORLD         []map[string]any
	}{
		Title:             "Awesome Boardgames (FR)",
		Comparators:       data["comparators"],
		Editors:           data["editors"],
		General:           data["general"],
		VPC:               data["vpc"], // just in case ...
		Comparators_FR:    filter(data["comparators"], []string{"fr"}),
		Comparators_WORLD: filter(data["comparators"], []string{"de", "be", "international"}),
		VPC_FR:            filter(data["vpc"], []string{"fr"}),
		VPC_DE:            filter(data["vpc"], []string{"de"}),
		VPC_BE:            filter(data["vpc"], []string{"be"}),
		VPC_WORLD:         filter(data["vpc"], []string{"international"}),
	}

	if err := tpl.Execute(outputFile, context); err != nil {
		return fmt.Errorf("execute template: %w", err)
	}

	return nil
}

func readYAMLData(dataDirectory string) (map[string][]map[string]any, error) {
	entries, err := os.ReadDir(dataDirectory)
	if err != nil {
		return nil, fmt.Errorf("read data directory %q: %w", dataDirectory, err)
	}

	data := make(map[string][]map[string]any)
	for _, entry := range entries {
		if entry.IsDir() || (!strings.HasSuffix(entry.Name(), ".yaml") && !strings.HasSuffix(entry.Name(), ".yml")) {
			continue
		}

		path := filepath.Join(dataDirectory, entry.Name())
		content, err := os.ReadFile(path)
		if err != nil {
			return nil, fmt.Errorf("read %q: %w", path, err)
		}

		var items []map[string]any
		if err := yaml.Unmarshal(content, &items); err != nil {
			return nil, fmt.Errorf("parse %q: %w", path, err)
		}

		key := strings.TrimSuffix(entry.Name(), filepath.Ext(entry.Name()))
		sort.SliceStable(items, func(i, j int) bool {
			leftName, _ := items[i]["name"].(string)
			rightName, _ := items[j]["name"].(string)
			return strings.ToLower(leftName) < strings.ToLower(rightName)
		})
		data[key] = items
	}

	return data, nil
}
