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
      <div>{type === "visible" ? `visible : 화면에 보일 때` : `load : 페이지 로드 후`}</div>
      <h3>
        {greeting}! Thank you for visiting! ({count})
      </h3>
      <Button
        className="m-2"
        onClick={() => {
          setGreeting(randomMessage());
          setCount((prev) => prev + 1);
        }}
      >
        change
      </Button>
    </div>
  );
}
