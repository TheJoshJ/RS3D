import React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cn } from "@/lib/utils";
import {
  CheckIcon,
  ChevronRight,
  Loader,
  XIcon,
  type LucideIcon,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

interface TreeDataItem {
  id: string;
  name: string;
  status: string;
  icon?: LucideIcon;
  children?: TreeDataItem[];
}

type TreeProps = React.HTMLAttributes<HTMLDivElement> & {
  data: TreeDataItem[] | TreeDataItem;
  initialSlelectedItemId?: string;
  onSelectChange?: (item: TreeDataItem | undefined) => void;
  expandAll?: boolean;
  folderIcon?: LucideIcon;
  itemIcon?: LucideIcon;
};

const QuestTree = React.forwardRef<HTMLDivElement, TreeProps>(
  (
    {
      data,
      initialSlelectedItemId,
      onSelectChange,
      expandAll,
      folderIcon,
      itemIcon,
      className,
      ...props
    },
    ref
  ) => {
    const [selectedItemId, setSelectedItemId] = React.useState<
      string | undefined
    >(initialSlelectedItemId);

    const handleSelectChange = React.useCallback(
      (item: TreeDataItem | undefined) => {
        setSelectedItemId(item?.id);
        if (onSelectChange) {
          onSelectChange(item);
        }
      },
      [onSelectChange]
    );

    const expandedItemIds = React.useMemo(() => {
      if (!initialSlelectedItemId) {
        return [] as string[];
      }

      const ids: string[] = [];

      function walkTreeItems(
        items: TreeDataItem[] | TreeDataItem,
        targetId: string
      ) {
        if (items instanceof Array) {
          // eslint-disable-next-line @typescript-eslint/prefer-for-of
          for (let i = 0; i < items.length; i++) {
            ids.push(items[i]!.id);
            if (walkTreeItems(items[i]!, targetId) && !expandAll) {
              return true;
            }
            if (!expandAll) ids.pop();
          }
        } else if (!expandAll && items.id === targetId) {
          return true;
        } else if (items.children) {
          return walkTreeItems(items.children, targetId);
        }
      }

      walkTreeItems(data, initialSlelectedItemId);
      return ids;
    }, [data, initialSlelectedItemId]);

    return (
      <div className={cn("overflow-hidden", className)}>
        <div className="relative p-2">
          <TreeItem
            data={data}
            ref={ref}
            selectedItemId={selectedItemId}
            handleSelectChange={handleSelectChange}
            expandedItemIds={expandedItemIds}
            FolderIcon={folderIcon}
            ItemIcon={itemIcon}
            {...props}
          />
        </div>
      </div>
    );
  }
);

type TreeItemProps = TreeProps & {
  selectedItemId?: string;
  handleSelectChange: (item: TreeDataItem | undefined) => void;
  expandedItemIds: string[];
  FolderIcon?: LucideIcon;
  ItemIcon?: LucideIcon;
};

const TreeItem = React.forwardRef<HTMLDivElement, TreeItemProps>(
  (
    {
      className,
      data,
      selectedItemId,
      handleSelectChange,
      FolderIcon,
      ItemIcon,
      ...props
    },
    ref
  ) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const handleQuestChange = (quest: string) => {
      const questName = searchParams.get("quest");
      if (questName !== quest) {
        setSearchParams({ quest: quest.toLowerCase() });
      }
    };

    return (
      <div ref={ref} role="tree" className={className} {...props}>
        <ul>
          {(data instanceof Array ? data : [data]).map((item) => (
            <li key={item.id} className="pl-4">
              <div
                className={cn(
                  "flex items-center py-2 px-2 cursor-pointer hover:bg-muted/80 rounded",
                  selectedItemId === item.id &&
                    "bg-accent text-accent-foreground"
                )}
                onClick={() => {
                  handleSelectChange(item);
                  handleQuestChange(item.name);
                }}
              >
                {item.status === "COMPLETED" ? (
                  <CheckIcon className="text-green-500 h-4 w-4 mr-2" />
                ) : item.status === "STARTED" ? (
                  <Loader className="text-yellow-500 h-4 w-4 mr-2" />
                ) : (
                  <XIcon className="text-red-500 h-4 w-4 mr-2" />
                )}
                {item.icon && (
                  <item.icon
                    className="h-4 w-4 shrink-0 mr-2 text-accent-foreground/50"
                    aria-hidden="true"
                  />
                )}
                {!item.icon && FolderIcon && (
                  <FolderIcon
                    className="h-4 w-4 shrink-0 mr-2 text-accent-foreground/50"
                    aria-hidden="true"
                  />
                )}
                <span className="text-sm truncate">{item.name}</span>
              </div>

              {item.children && (
                <TreeItem
                  data={item.children}
                  selectedItemId={selectedItemId}
                  handleSelectChange={handleSelectChange}
                  FolderIcon={FolderIcon}
                  ItemIcon={ItemIcon}
                  expandedItemIds={[]}
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }
);

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header>
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 w-full items-center py-2 transition-all last:[&[data-state=open]>svg]:rotate-90",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200 text-accent-foreground/50 ml-auto" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
      className
    )}
    {...props}
  >
    <div className="pb-1 pt-0">{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { QuestTree, type TreeDataItem };
