import { useState } from "react";

export default function Greeting({
  type,
  messages,
}: {
  type: "visible" | "load";
  messages: string[];
}) {
  const randomMessage = () => messages[Math.floor(Math.random() * messages.length)];

  const [greeting, setGreeting] = useState(messages[0]);

  return (
    <div>
      <div>{type === 'visible' ? `visible : 화면에 보일 때`:`load : 페이지 로드 후`}</div>
      <h3>{greeting}! Thank you for visiting!</h3>
      <button onClick={() => setGreeting(randomMessage())}>New Greeting</button>
    </div>
  );
}
