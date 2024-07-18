import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Greeting({
  type,
  messages,
}: {
  type: "visible" | "load";
  messages: string[];
}) {
  const randomMessage = () => messages[Math.floor(Math.random() * messages.length)];

  const [greeting, setGreeting] = useState(messages[0]);
  const [count, setCount] = useState(0);

  return (
    <div>
      <Button
        className="m-2"
        onClick={() => {
          setGreeting(randomMessage());
          setCount((prev) => prev + 1);
        }}
      >
        {greeting} ({count})
      </Button>
    </div>
  );
}
