document
  .getElementById("uploadButton")
  .addEventListener("click", async function () {
    const fileInput = document.getElementById("fileInput");
    const locationInput = document.getElementById("locationInput");
    const file = fileInput.files[0];
    const location = locationInput.value;

    if (!file || !location) {
      alert("Please select a file and enter location");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`http://locahost:3000/api/upload?location=${location}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }

      alert("File uploaded successfully");
    } catch (error) {
      alert("Error uploading file: " + error.message);
    }
  });
