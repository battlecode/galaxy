package run

type Submission struct {
	Source   FileSpecification `mapstructure:"source"`
	Binary   FileSpecification `mapstructure:"binary"`
	TeamName string            `mapstructure:"team-name"`
	Package  string            `mapstructure:"package"`
}

type CompileRequest struct {
	Submission `mapstructure:"submission,squash"`
}

type ExecuteRequest struct {
	A              Submission        `mapstructure:"a"`
	B              Submission        `mapstructure:"b"`
	Maps           []string          `mapstructure:"maps"`
	Replay         FileSpecification `mapstructure:"replay"`
	AlternateOrder bool              `mapstructure:"alternate-order"`
}

type FileSpecification struct {
	Bucket string `mapstructure:"bucket"`
	Name   string `mapstructure:"name"`
}
