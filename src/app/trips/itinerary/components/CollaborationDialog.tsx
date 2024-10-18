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

const CollaborationDialog = ({ isOpen, onClose }) => {
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
          <div className="flex flex-col sm:flex-row space-y-2 justify-between">
            <div className="flex space-x-3 items-center">
              <div className="size-9 rounded-full bg-gray-400 " />
              <div>
                <p className="font-semibold">Gio Mungcal</p>
                <p className="text-xs text-card-foreground/80 min-w-20">
                  fashionkilla79@gmail.com
                </p>
              </div>
            </div>
            <Select>
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
          <div className="flex flex-col sm:flex-row space-y-2 justify-between">
            <div className="flex space-x-3 items-center">
              <div className="size-9 rounded-full bg-gray-400 " />
              <div>
                <p className="font-semibold">Grim Falconer</p>
                <p className="text-xs text-card-foreground/80 min-w-20">
                  skinnylegend22@gmail.com
                </p>
              </div>
            </div>
            <Select>
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
