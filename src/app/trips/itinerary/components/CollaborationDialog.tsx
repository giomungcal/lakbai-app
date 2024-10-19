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
import { getUserRoles } from "@/utils/supabase/supabaseRequests";
import { useEffect, useState } from "react";
import { Database } from "../../../../../database.types";
import { getFullNameByUserId } from "../actions";

type Users = Database["public"]["Tables"]["user_roles"]["Row"];

const CollaborationDialog = ({ isOpen, onClose, itineraryId }) => {
  const [users, setUsers] = useState<Users[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { getToken } = useTripsContext();

  useEffect(() => {
    console.log("UseEffect Ran");

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

        <div className="space-y-2">
          {users.map((user) => (
            <div className="flex flex-col sm:flex-row space-y-2 justify-between">
              <div className="flex space-x-3 items-center">
                <div className="size-9 rounded-full bg-gray-400 " />
                <div>
                  <p className="font-semibold">gcmungcal@gmail.com</p>
                  <p className="text-xs text-card-foreground/80 min-w-20">
                    {user.user_id}
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
          ))}
        </div>

        <Separator />

        <div className="flex justify-between">
          <div className="space-y-1">
            <Label className="font-semibold text-base">Add Collaborator</Label>
            <p className="text-card-foreground/80 text-xs">
              Enter the email of the person you'd like to add.
            </p>
          </div>
          <Button>Add User</Button>
        </div>

        <div className="flex space-x-2">
          <Input className="flex-grow" />
          <Select>
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
