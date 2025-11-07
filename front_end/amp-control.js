const knobs = document.querySelectorAll(".knob");

      knobs.forEach((knob) => {
        const dial = knob.querySelector(".dial");
        const pointer = knob.querySelector(".pointer");
        const valueDisplay = knob.querySelector(".knob-value");

        let value = 50;
        let isDragging = false;
        let startY = 0;
        let startValue = 0;

        const setRotation = (val) => {
          const angle = (val - 50) * 2.7;
          pointer.style.transform = `rotate(${angle}deg)`;
          valueDisplay.textContent = Math.round(val);
        };

        setRotation(value);

        dial.addEventListener("mousedown", (e) => {
          isDragging = true;
          startY = e.clientY;
          startValue = value;
          document.body.style.cursor = "grabbing";
        });

        document.addEventListener("mousemove", (e) => {
          if (!isDragging) return;
          const dy = startY - e.clientY;
          value = Math.min(100, Math.max(0, startValue + dy / 2));
          setRotation(value);
        });

        document.addEventListener("mouseup", () => {
          isDragging = false;
          document.body.style.cursor = "default";
        });
      });