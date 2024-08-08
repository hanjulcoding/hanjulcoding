import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Greeting({ messages }: { messages: string[] }) {
  const messageList = () => messages[(count + 1) % messages.length];

  const [greeting, setGreeting] = useState(messages[0]);
  const [count, setCount] = useState(0);

  return (
    <div>
      <Button
        className="m-2"
        onClick={() => {
          setCount((prev) => prev + 1);
          setGreeting(messageList());
        }}
        title={count.toString()}
      >
        {greeting}
      </Button>
    </div>
  );
}
