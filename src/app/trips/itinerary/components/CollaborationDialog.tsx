"use client";

import { useTripsContext } from "@/app/_context/AppContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import {
  addUserRole,
  deleteUserRole,
  getUserRoles,
  updateUserRole,
} from "@/utils/supabase/supabaseRequests";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { Database } from "../../../../../database.types";

type Users = Database["public"]["Tables"]["user_roles"]["Row"];

type Role = "view" | "edit";

interface CollaborationDialog {
  isOpen: boolean;
  onClose: () => void;
  itineraryId: string;
  ownerId: string;
}

const CollaborationDialog = ({
  isOpen,
  onClose,
  itineraryId,
  ownerId,
}: CollaborationDialog) => {
  const [users, setUsers] = useState<Users[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmittingRole, setIsSubmittingRole] = useState<boolean>(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState<boolean>(false);

  const [emailAddress, setEmailAddress] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);

  const { getToken } = useTripsContext();

  const resetValues = () => {
    setEmailAddress(null);
    setRole(null);
  };

  const handleSubmitRole = async () => {
    setIsSubmittingRole(true);
    // Check if fields are complete
    if (!emailAddress || !role || emailAddress === "") {
      toast({
        title: "Fill up details",
        description: "Both email address and access level fields are required.",
        variant: "default",
      });
      setIsSubmittingRole(false);
      return;
    }

    // Identify if the email address already has access
    const roleForUserExists = users?.find((user) => {
      if (user.email_address === emailAddress) {
        return true;
      }
      return false;
    });

    if (roleForUserExists) {
      toast({
        title: "Access already exists for user",
        description:
          "You can manage the user's access level in the section above.",
        variant: "default",
      });
      setIsSubmittingRole(false);

      return;
    }

    const token = await getToken({ template: "lakbai-supabase" });
    const result = await addUserRole({
      token,
      emailAddress,
      role,
      itineraryId,
      ownerId,
    });

    if (result) {
      setUsers((prev) => [...prev, result[0]]);
      resetValues();
      toast({
        title: "Collaborator added.",
        description: `${result[0].first_name} ${result[0].last_name} has been added as collaborator.`,
        variant: "default",
      });
      // NEXT TASK: Set Users temporarily on success and add toast
      // THEN: Setup the changing of privilege -> changing from view to edit vice-versa
    }

    setIsSubmittingRole(false);
  };

  const handleUpdateRole = async (role: string, roleId: string) => {
    setIsUpdatingRole(true);

    const token = await getToken({ template: "lakbai-supabase" });
    const result = await updateUserRole({ token, role, roleId });

    if (result && result.length !== 0) {
      setUsers((prev) => {
        return prev.map((u) => (u.id === roleId ? { ...u, role } : u));
      });
      toast({
        title: "User role updated",
        description: `Role has been updated to ${role}.`,
        variant: "default",
      });

      setIsUpdatingRole(false);
    }

    toast({
      title: "Uh oh! Something went wrong.",
      description: `The role has not been updated. Try again.`,
      variant: "default",
    });
    setIsUpdatingRole(false);
  };

  const handleDeleteRole = async (roleId: string) => {
    setIsUpdatingRole(true);
    const token = await getToken({ template: "lakbai-supabase" });
    const result = await deleteUserRole({ token, roleId });

    if (result && result.length !== 0) {
      setUsers((prev) => {
        return prev.filter((u) => u.id !== roleId);
      });

      toast({
        title: "Collaborator removed",
        description: `User has been removed from the collaboration list.`,
        variant: "default",
      });

      setIsUpdatingRole(false);
      return;
    }

    toast({
      title: "Uh oh! Something went wrong.",
      description: `The role has not been updated. Try again.`,
      variant: "default",
    });
    setIsUpdatingRole(false);
    return;
  };

  useEffect(() => {
    setIsLoading(true);
    const getUsers = async () => {
      const token = await getToken({ template: "lakbai-supabase" });
      const result = await getUserRoles({ token, itineraryId });

      if (result) {
        setUsers(result);
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
                        alt="Collaborator Image"
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
                  <Select
                    disabled={isUpdatingRole}
                    value={user.role}
                    onValueChange={(value) => handleUpdateRole(value, user.id)}
                  >
                    <SelectTrigger className="w-auto sm:w-[130px]">
                      <SelectValue placeholder="Access level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="edit">Can Edit</SelectItem>
                        <SelectItem value="view">Can View</SelectItem>
                        <SelectSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              className={`text-sm font-normal w-full justify-center space-x-1 flex`}
                              variant="default"
                            >
                              Remove access
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will delete the role for {user.first_name}{" "}
                                {user.last_name}. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteRole(user.id)}
                              >
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-14 w-full border-2 rounded-xl border-accent border-dashed bg-card">
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
              Enter the email of the person you&apos;d like to add.
            </p>
          </div>
          <Button
            className="min-w-24"
            disabled={isSubmittingRole}
            onClick={handleSubmitRole}
          >
            {!isSubmittingRole ? (
              "Add User"
            ) : (
              <Loader width={14} height={14} className="animate-spin" />
            )}
          </Button>
        </div>

        <div className="flex space-x-2">
          <Input
            required
            name="email"
            disabled={isSubmittingRole}
            className="flex-grow"
            value={emailAddress ?? ""}
            onChange={(e) => setEmailAddress(e.target.value)}
          />
          <Select
            disabled={isSubmittingRole}
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
