import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

interface ShareItineraryDialog {
  isOpen: boolean;
  onClose: () => void;
  isPublic: boolean;
  onPublicChange: () => void;
  isOwner: boolean;
}

const ShareItineraryDialog = ({
  isOpen,
  onClose,
  isPublic,
  onPublicChange,
  isOwner,
}: ShareItineraryDialog) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-8 space-y-2">
        <DialogHeader>
          <DialogTitle>Share this itinerary</DialogTitle>
          <DialogDescription>
            If set to public, anyone with the link can view this document
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Input className="flex-grow" defaultValue={window.location.href} />
          <Button
            variant="default"
            className="max-w-36"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast({
                title: "Link copied to clipboard",
              });
            }}
          >
            Copy Link
          </Button>
        </div>
        {isOwner && (
          <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5 p-1">
              <Label>Set Itinerary to Public Access</Label>
              <p className="text-card-foreground/80 text-xs">
                If set to true, allows this trip to be publicly viewable.
              </p>
            </div>
            <Switch checked={isPublic} onCheckedChange={onPublicChange} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShareItineraryDialog;
