import React from 'react';

const QUOTES = [
  { quote: "Success is not the key to happiness. Happiness is the key to success.", author: "Albert Schweitzer" },
  { quote: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
  { quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { quote: "Dream big and dare to fail.", author: "Norman Vaughan" },
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { quote: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { quote: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill" },
  { quote: "Everything you’ve ever wanted is on the other side of fear.", author: "George Addair" },
  { quote: "Your limitation—it’s only your imagination.", author: "Unknown" },
  // ... add more as needed
];

export function MotivationalQuote() {
  const randomIndex = React.useMemo(() => Math.floor(Math.random() * QUOTES.length), []);
  const { quote, author } = QUOTES[randomIndex];

  return (
    <div className="p-3 bg-card/70 rounded-lg border border-border text-sm md:text-base flex flex-col items-start md:items-center min-w-[180px] max-w-xs shadow-md">
      <span className="italic text-muted-foreground">“{quote}”</span>
      <span className="mt-1 text-xs text-right w-full text-foreground font-semibold">— {author}</span>
    </div>
  );
}
