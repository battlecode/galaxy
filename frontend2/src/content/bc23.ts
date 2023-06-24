
export const BC23_QUICKSTART =
`This is the Battlecode 2023 contest website, which will be your main hub for all Battlecode-related things for the duration of the contest. For a general overview of what Battlecode is, visit [our landing page](https://battlecode.org/).

## Create an account and team

To participate in Battlecode, you need an account and a team. Each team can consist of 1 to 4 people.

[Create an account](/register) on this website, and then go to the [team section](/bc23/team) to either create or join a team.

## Installation

### Step 1: Install Java

You'll need a Java Development Kit (JDK) version 8. Unfortunately, higher versions will not work. [Download it here](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html). You may need to create an Oracle account.

- Alternatively, you can install a JDK yourself using your favorite package manager. Make sure it's an Oracle JDK — we don't support anything else — and is compatible with Java 8.

If you're unsure how to install the JDK, you can find instructions for all operating systems [here](https://docs.oracle.com/javase/8/docs/technotes/guides/install/install_overview.html) (pay attention to \`PATH\` and \`CLASSPATH\`).

### Step 2: Download Battlecode

Next, you should download the [Battlecode 2023 scaffold](https://github.com/battlecode/battlecode23-scaffold). To get up and running quickly, you can click "Clone or download" and then "Download ZIP," and move on to the next step.

# Troubleshooting
`;

export const BC23_RESOURCES =
`# Markdown syntax guide

## Headers

# This is a Heading h1
## This is a Heading h2
###### This is a Heading h6

## Emphasis

*This text will be italic*
_This will also be italic_

**This text will be bold**
__This will also be bold__

_You **can** combine them_

## Lists

### Unordered

* Item 1
* Item 2
* Item 2a
* Item 2b

### Ordered

1. Item 1
1. Item 2
1. Item 3
  1. Item 3a
  1. Item 3b

## Images

![This is an alt text.](/image/sample.png "This is a sample image.")

## Links

You may be using [Markdown Live Preview](https://markdownlivepreview.com/).

## Blockquotes

> Markdown is a lightweight markup language with plain-text-formatting syntax, created in 2004 by John Gruber with Aaron Swartz.
>
>> Markdown is often used to format readme files, for writing messages in online discussion forums, and to create rich text using a plain text editor.

## Tables

| Left columns  | Right columns |
| ------------- |:-------------:|
| left foo      | right foo     |
| left bar      | right bar     |
| left baz      | right baz     |

## Blocks of code

\`\`\`
let message = 'Hello world';
alert(message);
\`\`\`

## Inline code

This web site is using \`markedjs/marked\`.
`;
