import { render, screen } from "@testing-library/react";

function BalanceCard({ amount }: { amount: number }) {
  return <div>Balance actual: ${amount}</div>;
}

test("muestra el balance actual", () => {
  render(<BalanceCard amount={123} />);
  expect(screen.getByText("Balance actual: $123")).toBeInTheDocument();
});
