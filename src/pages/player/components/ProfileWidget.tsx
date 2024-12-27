import { ReactNode } from "react";

interface ProfileWidgetProps {
  children?: ReactNode;
  title?: string;
}

const ProfileWidget = ({ children, title }: ProfileWidgetProps) => {
  return (
    <div className="h-[250px] p-3 m-3 border-secondary border rounded-md">
      {title && (
        <div
          className={
            "flex items-center w-full border-b border-muted-foreground"
          }
        >
          <p className={"w-full text-center"}>{title}</p>
        </div>
      )}
      <div className="p-2">{children && children}</div>
    </div>
  );
};

export default ProfileWidget;
