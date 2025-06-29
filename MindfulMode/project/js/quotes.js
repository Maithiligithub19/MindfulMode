// Inspirational quotes for MindfulMode

class QuoteManager {
  constructor() {
    this.quotes = [
      {
        text: "The present moment is the only time over which we have dominion.",
        author: "Thích Nhất Hạnh"
      },
      {
        text: "Mindfulness is about being fully awake in our lives.",
        author: "Jon Kabat-Zinn"
      },
      {
        text: "Peace comes from within. Do not seek it without.",
        author: "Buddha"
      },
      {
        text: "The mind is everything. What you think you become.",
        author: "Buddha"
      },
      {
        text: "Wherever you are, be there totally.",
        author: "Eckhart Tolle"
      },
      {
        text: "The best way to take care of the future is to take care of the present moment.",
        author: "Thích Nhất Hạnh"
      },
      {
        text: "Mindfulness isn't difficult, we just need to remember to do it.",
        author: "Sharon Salzberg"
      },
      {
        text: "The little things? The little moments? They aren't little.",
        author: "Jon Kabat-Zinn"
      },
      {
        text: "Be yourself and go with your feelings. That's the only way to be authentic.",
        author: "Anonymous"
      },
      {
        text: "Your vibe attracts your tribe. Keep it positive! ✨",
        author: "Gen Z Wisdom"
      },
      {
        text: "Progress over perfection, always. You're doing amazing! 💪",
        author: "Self-Care Reminder"
      },
      {
        text: "It's okay to not be okay. Healing isn't linear. 🌱",
        author: "Mental Health Reminder"
      },
      {
        text: "Small steps still move you forward. Celebrate every win! 🎉",
        author: "Motivation"
      },
      {
        text: "Your mental health matters more than your productivity. 💙",
        author: "Wellness Reminder"
      },
      {
        text: "Comparison is the thief of joy. Your journey is unique. 🌟",
        author: "Self-Love"
      },
      {
        text: "Rest is not a reward for work completed. It's a requirement. 😴",
        author: "Rest Reminder"
      },
      {
        text: "You don't have to be positive all the time. Feel your feelings. 🌈",
        author: "Emotional Wellness"
      },
      {
        text: "Growth happens outside your comfort zone, but so does anxiety. Balance is key. ⚖️",
        author: "Balance"
      },
      {
        text: "Your worth isn't measured by your productivity. You matter just as you are. 💎",
        author: "Self-Worth"
      },
      {
        text: "Taking breaks isn't giving up. It's recharging for the next level. 🔋",
        author: "Energy Management"
      }
    ];
    
    this.dailyQuote = this.getDailyQuote();
  }

  // Get a consistent daily quote based on date
  getDailyQuote() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const index = dayOfYear % this.quotes.length;
    return this.quotes[index];
  }

  // Get random quote
  getRandomQuote() {
    return randomChoice(this.quotes);
  }

  // Get quote by mood
  getQuoteByMood(mood) {
    const moodQuotes = {
      anxious: [
        {
          text: "Breathe in peace, breathe out stress. You've got this! 🌸",
          author: "Calm Vibes"
        },
        {
          text: "Anxiety is temporary. Your strength is permanent. 💪",
          author: "Inner Strength"
        },
        {
          text: "One breath at a time. One moment at a time. 🫁",
          author: "Mindful Breathing"
        }
      ],
      'low-energy': [
        {
          text: "Rest is productive too. Honor your energy levels. 🌙",
          author: "Energy Wisdom"
        },
        {
          text: "Low energy doesn't mean low worth. You're still amazing. ✨",
          author: "Self-Compassion"
        },
        {
          text: "Sometimes the most productive thing you can do is rest. 😴",
          author: "Rest Reminder"
        }
      ],
      confident: [
        {
          text: "Your confidence is magnetic. Keep shining! ⭐",
          author: "Confidence Boost"
        },
        {
          text: "You're not just ready for today, you're ready to conquer it! 🚀",
          author: "Daily Motivation"
        },
        {
          text: "Confidence looks good on you. Wear it proudly! 👑",
          author: "Self-Love"
        }
      ],
      unfocused: [
        {
          text: "Clarity comes with action. Start small, build momentum. 🎯",
          author: "Focus Tips"
        },
        {
          text: "It's okay to feel scattered. Breathe and prioritize one thing. 📝",
          author: "Mindful Focus"
        },
        {
          text: "Focus is a muscle. The more you practice, the stronger it gets. 🧠",
          author: "Mental Training"
        }
      ],
      excited: [
        {
          text: "Channel that energy into something amazing! 🔥",
          author: "Energy Direction"
        },
        {
          text: "Your excitement is contagious. Spread those good vibes! 🌟",
          author: "Positive Energy"
        },
        {
          text: "Excitement is the fuel of achievement. Use it wisely! ⚡",
          author: "Achievement Mindset"
        }
      ]
    };

    const quotes = moodQuotes[mood] || this.quotes;
    return randomChoice(quotes);
  }

  // Get motivational quote for tasks
  getTaskQuote() {
    const taskQuotes = [
      {
        text: "Done is better than perfect. Just start! 🚀",
        author: "Productivity"
      },
      {
        text: "Every task completed is a step toward your goals. 📈",
        author: "Progress"
      },
      {
        text: "You don't have to be great to get started, but you have to get started to be great. 💫",
        author: "Getting Started"
      },
      {
        text: "Small progress is still progress. Keep going! 🌱",
        author: "Momentum"
      },
      {
        text: "The best time to start was yesterday. The second best time is now. ⏰",
        author: "Action"
      }
    ];
    
    return randomChoice(taskQuotes);
  }

  // Get gratitude prompt
  getGratitudePrompt() {
    const prompts = [
      "What made you smile today?",
      "Who are you grateful for right now?",
      "What's one thing that went well today?",
      "What's something beautiful you noticed today?",
      "What's a small pleasure you enjoyed recently?",
      "What's something about yourself you appreciate?",
      "What's a memory that brings you joy?",
      "What's something in nature you're thankful for?",
      "What's a skill or ability you're grateful to have?",
      "What's something that made your day easier?",
      "What's a song, book, or show you're grateful for?",
      "What's something you're looking forward to?",
      "What's a challenge that helped you grow?",
      "What's something cozy or comforting in your life?",
      "What's an act of kindness you witnessed or received?"
    ];
    
    return randomChoice(prompts);
  }

  // Get affirmation
  getAffirmation() {
    const affirmations = [
      "I am worthy of love and respect.",
      "I choose peace over worry.",
      "I am growing stronger every day.",
      "I trust in my ability to handle whatever comes my way.",
      "I am exactly where I need to be right now.",
      "I choose to focus on what I can control.",
      "I am proud of how far I've come.",
      "I deserve to take up space.",
      "I am learning and growing from every experience.",
      "I choose self-compassion over self-criticism.",
      "I am enough, just as I am.",
      "I trust my intuition and inner wisdom.",
      "I am creating a life I love.",
      "I choose to see the good in today.",
      "I am resilient and capable of overcoming challenges."
    ];
    
    return randomChoice(affirmations);
  }

  // Display quote in element
  displayQuote(element, quote = null) {
    const quoteToShow = quote || this.dailyQuote;
    
    if (element) {
      const quoteText = element.querySelector('.quote-text') || element;
      const quoteAuthor = element.querySelector('.quote-author');
      
      quoteText.textContent = `"${quoteToShow.text}"`;
      if (quoteAuthor) {
        quoteAuthor.textContent = `— ${quoteToShow.author}`;
      }
      
      // Add fade-in animation
      element.style.opacity = '0';
      element.style.transform = 'translateY(10px)';
      
      setTimeout(() => {
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, 100);
    }
  }

  // Fetch quote from external API (fallback to local quotes)
  async fetchExternalQuote() {
    try {
      const response = await fetch('https://zenquotes.io/api/today');
      const data = await response.json();
      
      if (data && data[0]) {
        return {
          text: data[0].q,
          author: data[0].a
        };
      }
    } catch (error) {
      console.log('External quote API unavailable, using local quotes');
    }
    
    return this.getDailyQuote();
  }
}

// Create global quote manager
const quoteManager = new QuoteManager();

// Load daily quote on page load
document.addEventListener('DOMContentLoaded', async () => {
  const quoteElement = document.getElementById('dailyQuote');
  const authorElement = document.getElementById('quoteAuthor');
  
  if (quoteElement) {
    // Try to fetch external quote, fallback to local
    const quote = await quoteManager.fetchExternalQuote();
    
    quoteElement.textContent = `"${quote.text}"`;
    if (authorElement) {
      authorElement.textContent = `— ${quote.author}`;
    }
    
    // Animate in
    setTimeout(() => {
      quoteElement.style.opacity = '1';
      quoteElement.style.transform = 'translateY(0)';
    }, 500);
  }
});