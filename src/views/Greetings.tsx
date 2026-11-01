import { useQuery } from "@tanstack/react-query";
import type { CustomerResponse } from "../api/types";
import { Skeleton } from "../components/Skeleton";
import { Avatar } from "radix-ui";
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
      <Avatar.Root className="user-avatar">
        <Avatar.Fallback delayMs={0}>
          {customer?.firstName?.charAt(0)}
          {customer?.lastName?.charAt(0)}
        </Avatar.Fallback>
      </Avatar.Root>

      <h1>Good evening, {customer?.firstName}</h1>
    </div>
  );
}
