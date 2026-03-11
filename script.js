const botNameInput = document.getElementById("botName");
const subjectInput = document.getElementById("subject");
const topicInput = document.getElementById("topic");
const runBtn = document.getElementById("runBtn");
const clearBtn = document.getElementById("clearBtn");
const consoleOutput = document.getElementById("consoleOutput");

function printLine(text) {
  const line = document.createElement("div");
  line.className = "line";
  line.textContent = `> ${text}`;
  consoleOutput.appendChild(line);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function clearConsole() {
  consoleOutput.innerHTML = "";
}

function runLesson() {
  clearConsole();

  const botName = botNameInput.value.trim() || "teacherBot";
  const subject = subjectInput.value.trim() || "JavaScript";
  const topic = topicInput.value.trim() || "strings";

  printLine("Hi there!");

  const greeting = `My name is ${botName}.`;
  printLine(greeting);

  const sentence = `Today, you will learn about ${topic} in ${subject}.`;
  printLine(sentence);

  const strLengthIntro = `Here is an example of using the length property on the word ${subject}.`;
  printLine(strLengthIntro);
  printLine(subject.length);

  printLine(`Here is an example of using the length property on the word ${topic}.`);
  printLine(topic.length);

  printLine(`Here is an example of accessing the first letter in the word ${subject}.`);
  printLine(subject[0] || "(empty)");

  printLine(`Here is an example of accessing the second letter in the word ${subject}.`);
  printLine(subject[1] || "(not available)");

  printLine(`Here is an example of accessing the last letter in the word ${subject}.`);
  const lastCharacter = subject[subject.length - 1] || "(empty)";
  printLine(lastCharacter);

  const learningIsFunSentence = "Learning is fun.";

  printLine("Here are examples of finding the positions of substrings in the sentence.");
  printLine(`Index of "Learning": ${learningIsFunSentence.indexOf("Learning")}`);
  printLine(`Index of "fun": ${learningIsFunSentence.indexOf("fun")}`);
  printLine(`Index of "learning": ${learningIsFunSentence.indexOf("learning")}`);

  printLine("I hope you enjoyed learning today.");
}

runBtn.addEventListener("click", runLesson);
clearBtn.addEventListener("click", clearConsole);