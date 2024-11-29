import { useParams } from "react-router-dom";

export function Account() {
  const { accountId } = useParams();
  return (
    <div>
      <p>showing account: {accountId}</p>
    </div>
  );
}
