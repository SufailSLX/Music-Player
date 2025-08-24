"use client"

import { useEffect } from "react"

export function GhostFooter() {
  useEffect(() => {
    // Add the ghost animation styles to the document
    const style = document.createElement("style")
    style.textContent = `
      @import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@900&display=swap");
      
      .ghost-container {
        position: relative;
        width: 100%;
        height: 32px; /* reduced height from 40px to 32px */
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        background: #121212;
        border-top: 1px solid #333333;
      }

      .ghost-title {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 2;
      }

      .ghost-title h1 {
        font-size: clamp(0.8rem, 2.5vw, 1.2rem); /* reduced font size slightly */
        font-weight: 900;
        font-family: "Montserrat", sans-serif;
        color: #ffffff;
        margin: 0;
        white-space: nowrap;
      }

      .ghost {
        width: 6vmin;
        height: 8vmin;
        background-color: #ffffff;
        background-image: radial-gradient(ellipse at 35% 40%, #121212 8%, transparent 0%),
          radial-gradient(ellipse at 65% 40%, #121212 8%, transparent 0%),
          radial-gradient(ellipse at 50% 60%, #121212 8%, transparent 0%);
        border-radius: 100% / 70% 70% 0% 0%;
        transform: translateX(100em) rotateZ(-90deg);
        position: relative;
        opacity: 0.9;
        mix-blend-mode: exclusion;
        animation: ghostMove 4s ease-out infinite;
      }

      @keyframes ghostMove {
        0% {
          transform: translateX(30em) rotateZ(-90deg);
        }
        100% {
          transform: translateX(-35em) rotateZ(-90deg);
        }
      }

      .ghost div {
        position: absolute;
        width: 20%;
        background-color: #ffffff;
      }

      .ghost div:nth-of-type(1) {
        height: 5vmin;
        left: 0;
        bottom: -4vmin;
        border-radius: 100% / 0% 0% 50% 50%;
      }

      .ghost div:nth-of-type(2),
      .ghost div:nth-of-type(4) {
        height: 3vmin;
        left: 20%;
        bottom: -2vmin;
        border-radius: 100% / 50% 50% 0% 0%;
        background-color: transparent;
      }

      .ghost div:nth-of-type(3) {
        height: 3vmin;
        left: 40%;
        bottom: -2.5vmin;
        border-radius: 100% / 0% 0% 60% 60%;
        background-color: #ffffff;
      }

      .ghost div:nth-of-type(4) {
        left: 60%;
      }

      .ghost div:nth-of-type(5) {
        height: 2vmin;
        left: 80%;
        bottom: -1.8vmin;
        border-radius: 100% / 0% 0% 70% 70%;
        background-color: #ffffff;
      }

      @media (max-width: 640px) {
        .ghost-container {
          height: 28px; /* reduced mobile height from 35px to 28px */
        }
        
        .ghost-title h1 {
          font-size: clamp(0.7rem, 2vw, 1rem); /* reduced mobile font size */
        }
        
        .ghost {
          width: 5vmin;
          height: 6vmin;
        }
        
        .ghost div:nth-of-type(1) {
          height: 4vmin;
          bottom: -3vmin;
        }
        
        .ghost div:nth-of-type(2),
        .ghost div:nth-of-type(4) {
          height: 2.5vmin;
          bottom: -1.5vmin;
        }
        
        .ghost div:nth-of-type(3) {
          height: 2.5vmin;
          bottom: -2vmin;
        }
        
        .ghost div:nth-of-type(5) {
          height: 1.8vmin;
          bottom: -1.4vmin;
        }
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <footer className="ghost-container">
      <div className="ghost-title">
        <h1>Powered by SLX.dev</h1>
      </div>
      <div className="ghost">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </footer>
  )
}
