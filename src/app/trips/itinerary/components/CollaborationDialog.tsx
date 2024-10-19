"use client";

import { useTripsContext } from "@/app/_context/AppContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { addUserRole, getUserRoles } from "@/utils/supabase/supabaseRequests";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { Database } from "../../../../../database.types";
import { getFullNameByUserId } from "../actions";

type Users = Database["public"]["Tables"]["user_roles"]["Row"];

type Role = "view" | "edit";

const CollaborationDialog = ({ isOpen, onClose, itineraryId }) => {
  const [users, setUsers] = useState<Users[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [emailAddress, setEmailAddress] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);

  const { getToken } = useTripsContext();

  //   useEffect(() => {
  //     console.log(emailAddress);
  //     console.log(role);
  //   }, [emailAddress, role]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Check if fields are complete
    if (!emailAddress || !role || emailAddress === "") {
      toast({
        title: "Fill up details.",
        description: "Both email address and access level fields are required.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const token = await getToken({ template: "lakbai-supabase" });
    const result = await addUserRole({
      token,
      emailAddress,
      role,
      itineraryId,
    });

    if (result) {
      console.log(result[0]);
    }

    setIsSubmitting(false);
  };

  useEffect(() => {
    setIsLoading(true);
    const getUsers = async () => {
      const token = await getToken({ template: "lakbai-supabase" });
      const result = await getUserRoles({ token, itineraryId });

      if (result) {
        setUsers(result);

        // NEXT TASK: Set Users temporarily on success
        // THEN: Setup the changing of privilege -> changing from view to edit vice-versa
      }
      setIsLoading(false);
    };
    getUsers();
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent className="p-8 space-y-2">
        <DialogHeader>
          <DialogTitle>Collaboration</DialogTitle>
          <DialogDescription>
            Manage the people who have access to this itinerary.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex space-x-3 items-center">
            <div className="size-9 rounded-full bg-slate-200 animate-pulse" />
            <div className="h-9 flex-grow bg-slate-200 animate-pulse rounded-xl" />
          </div>
        ) : (
          <div className="space-y-2">
            {users.length !== 0 ? (
              users.map((user) => (
                <div
                  key={user.user_id}
                  className="flex flex-col sm:flex-row space-y-2 justify-between"
                >
                  <div className="flex space-x-3 items-center">
                    <div className="size-9 object-cover">
                      <img
                        src={user.image_url}
                        className="w-full h-full rounded-full"
                      />
                    </div>

                    <div>
                      <p className="font-semibold">{`${user.first_name} ${user.last_name}`}</p>
                      <p className="text-xs text-card-foreground/80 min-w-20">
                        {user.email_address}
                      </p>
                    </div>
                  </div>
                  <Select value={user.role}>
                    <SelectTrigger className="w-auto sm:w-[130px]">
                      <SelectValue placeholder="Access level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="edit">Can Edit</SelectItem>
                        <SelectItem value="view">Can View</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-14 w-full border-2 rounded-xl border-accent border-dashed bg-slate-100">
                <span className="text-sm text-muted-foreground">
                  👻 No collaborators yet.
                </span>
              </div>
            )}
          </div>
        )}

        <Separator />

        <div className="flex justify-between">
          <div className="space-y-1">
            <Label className="font-semibold text-base">Add Collaborator</Label>
            <p className="text-card-foreground/80 text-xs">
              Enter the email of the person you'd like to add.
            </p>
          </div>
          <Button
            className="min-w-24"
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            {!isSubmitting ? (
              "Add User"
            ) : (
              <Loader width={14} height={14} className="animate-spin" />
            )}
          </Button>
        </div>

        <div className="flex space-x-2">
          <Input
            disabled={isSubmitting}
            className="flex-grow"
            value={emailAddress ?? ""}
            onChange={(e) => setEmailAddress(e.target.value)}
          />
          <Select
            disabled={isSubmitting}
            value={role ?? ""}
            onValueChange={(value) => setRole(value as Role)}
          >
            <SelectTrigger className="w-auto sm:min-w-[130px]">
              <SelectValue placeholder="Access level" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="edit">Can Edit</SelectItem>
                <SelectItem value="view">Can View</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CollaborationDialog;
