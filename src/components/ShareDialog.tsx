import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { CopyIcon, CheckIcon } from 'lucide-react';
import { useLocation } from '@tanstack/react-router';

export default function ShareDialog() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const { pathname, search } = useLocation();
  const searchParams = new URLSearchParams(search);

  useEffect(() => {
    const url = `${window.location.origin}${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    setCurrentUrl(url);
  }, [pathname, searchParams]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          Share Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Report</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2">
            <Input
              value={currentUrl}
              readOnly
              className="flex-1"
              onClick={(e) => e.target.select()}
            />
            <Button onClick={handleCopy} variant="outline" size="icon">
              {copied ? (
                <CheckIcon className="h-4 w-4 text-green-500" />
              ) : (
                <CopyIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
          {copied && <p className="text-sm text-green-500">Copied to clipboard!</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
