import { useQuery } from "@tanstack/react-query";
import type { CustomerResponse } from "../api/types";
import { Skeleton } from "../components/Skeleton";
import { apiFetch } from "../api/client";

export default function Greetings() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["customer"],
    queryFn: () => apiFetch<CustomerResponse>("/api/customer"),
  });

  if (isLoading || isError) {
    return <Skeleton height="70px" />;
  }

  const customer = data?.customer;

  return (
    <div className="greeting-container">
      <h1>Good evening, {customer?.firstName}</h1>
    </div>
  );
}
