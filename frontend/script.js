async function generate() {
  const prompt = document.getElementById("prompt").value;
  const outputBox = document.getElementById("output");

  // Validate input
  if (!prompt.trim()) {
    outputBox.innerText = "⚠️ Please enter a prompt first!";
    outputBox.classList.add("error");
    return;
  }

  // Remove error class and show loading state
  outputBox.classList.remove("error");
  outputBox.classList.add("loading");
  outputBox.innerText = "🤔 Thinking... Please wait a moment...\n";

  try {
    const response = await fetch("http://localhost:5000/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();

    console.log("FRONTEND DATA:", data);

    outputBox.classList.remove("loading");

    // Handle backend errors
    if (data.error) {
      outputBox.classList.add("error");
      outputBox.innerText = "❌ Error:\n\n" + data.error;
    } else {
      // Format output with markdown support
      outputBox.innerHTML = formatMarkdown(data.output);
      outputBox.classList.remove("error");
    }

  } catch (error) {
    console.error("Error:", error);
    outputBox.classList.remove("loading");
    outputBox.classList.add("error");
    outputBox.innerText = "⚠️ Connection Error\n\nCannot connect to server.\nMake sure the backend is running on http://localhost:5000";
  }
}

// ✅ Generate Notes
async function generateNotes() {
  const prompt = document.getElementById("prompt").value;
  const outputBox = document.getElementById("output");

  if (!prompt.trim()) {
    outputBox.innerText = "⚠️ Please enter a prompt first!";
    outputBox.classList.add("error");
    return;
  }

  outputBox.classList.remove("error");
  outputBox.classList.add("loading");
  outputBox.innerText = "📝 Generating study notes... Please wait...\n";

  try {
    const response = await fetch("http://localhost:5000/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();
    outputBox.classList.remove("loading");

    if (data.error) {
      outputBox.classList.add("error");
      outputBox.innerHTML = "❌ Error:<br><br>" + data.error;
    } else {
      outputBox.innerHTML = formatMarkdown(data.output);
      outputBox.classList.remove("error");
    }
  } catch (error) {
    console.error("Error:", error);
    outputBox.classList.remove("loading");
    outputBox.classList.add("error");
    outputBox.innerText = "⚠️ Connection Error\n\nCannot connect to server.";
  }
}

// ✅ Generate Assignments
async function generateAssignments() {
  const prompt = document.getElementById("prompt").value;
  const outputBox = document.getElementById("output");

  if (!prompt.trim()) {
    outputBox.innerText = "⚠️ Please enter a prompt first!";
    outputBox.classList.add("error");
    return;
  }

  outputBox.classList.remove("error");
  outputBox.classList.add("loading");
  outputBox.innerText = "📋 Generating assignments... Please wait...\n";

  try {
    const response = await fetch("http://localhost:5000/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();
    outputBox.classList.remove("loading");

    if (data.error) {
      outputBox.classList.add("error");
      outputBox.innerHTML = "❌ Error:<br><br>" + data.error;
    } else {
      outputBox.innerHTML = formatMarkdown(data.output);
      outputBox.classList.remove("error");
    }
  } catch (error) {
    console.error("Error:", error);
    outputBox.classList.remove("loading");
    outputBox.classList.add("error");
    outputBox.innerText = "⚠️ Connection Error\n\nCannot connect to server.";
  }
}

// Allow Enter key to generate (Ctrl+Enter or Cmd+Enter)
document.addEventListener("DOMContentLoaded", function() {
  const textarea = document.getElementById("prompt");
  if (textarea) {
    textarea.addEventListener("keydown", function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        generate();
      }
    });
  }
});

// ✅ Function to format markdown text to HTML
function formatMarkdown(text) {
  // Escape HTML to prevent injection
  text = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Convert markdown headers BEFORE line breaks
  // ### Header 3 (section headers)
  text = text.replace(/^###\s+(.+)$/gm, '<h3 class="md-h3">$1</h3>');
  // ## Header 2
  text = text.replace(/^##\s+(.+)$/gm, '<h2 class="md-h2">$1</h2>');
  // # Header 1
  text = text.replace(/^#\s+(.+)$/gm, '<h1 class="md-h1">$1</h1>');

  // Convert horizontal rules (---)
  text = text.replace(/^-{3,}$/gm, '<hr class="md-hr">');

  // Convert line breaks
  text = text.replace(/\n/g, "<br>");

  // Convert **text** to <strong>text</strong> (bold)
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // Convert *text* to <em>text</em> (italic)
  text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  // Make numbered sections stand out more
  text = text.replace(/(^|<br>)(\d+\.\s)/gm, '$1<span class="section-number">$2</span>');

  return text;
}