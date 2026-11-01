import { Avatar } from "radix-ui";
import { useQuery } from "@tanstack/react-query";
import type { CustomerResponse } from "../api/types";
import { apiFetch } from "../api/client";
import { Skeleton } from "../components/Skeleton";


export default function AvatarLogo(){

    const { data, isLoading, isError } = useQuery({
        queryKey: ["customer"],
        queryFn: () => apiFetch<CustomerResponse>("/api/customer"),
      });
    
      if (isLoading || isError) {
        return <Skeleton width="40px" borderRadius="20px" height="40px" />;
      }

      const customer = data?.customer;

      return <Avatar.Root className="user-avatar">
              <Avatar.Fallback delayMs={0}>
                {customer?.firstName?.charAt(0)}
                {customer?.lastName?.charAt(0)}
              </Avatar.Fallback>
            </Avatar.Root>
}