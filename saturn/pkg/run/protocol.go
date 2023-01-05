package run

type Submission struct {
	Source   FileSpecification `mapstructure:"source"`
	Binary   FileSpecification `mapstructure:"binary"`
	TeamName string            `mapstructure:"team-name"`
	Package  string            `mapstructure:"package"`
}

type CompileRequest struct {
	Submission `mapstructure:"submission"`
}

type ExecuteRequest struct {
	A      Submission        `mapstructure:"a"`
	B      Submission        `mapstructure:"b"`
	Replay FileSpecification `mapstructure:"replay"`
}

type FileSpecification struct {
	Bucket string `mapstructure:"bucket"`
	Name   string `mapstructure:"name"`
}
