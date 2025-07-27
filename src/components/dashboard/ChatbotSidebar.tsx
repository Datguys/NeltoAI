import { useProjects } from "./Features/YourProject";
import { Button } from "@/components/ui/button";
import { Plus, FolderOpen, FilePlus } from "lucide-react";

interface ChatbotSidebarProps {
  selectedProjectId: string | null;
  onSelectProject: (id: string | null) => void;
  onFileUpload: (file: File) => void;
}

export function ChatbotSidebar({ selectedProjectId, onSelectProject, onFileUpload }: ChatbotSidebarProps) {
  const { projects } = useProjects();

  return (
    <aside className="w-72 min-w-64 max-w-xs h-full bg-background/80 backdrop-blur-md border-r border-border flex flex-col p-6 gap-8">
      <div>
        <h2 className="text-2xl font-extrabold mb-2">AI Business Partner</h2>
        <div className="text-sm text-muted-foreground mb-4">Choose saved project</div>
        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
          {projects.length === 0 && (
            <div className="text-xs text-muted-foreground italic">No projects found</div>
          )}
          {projects.map((project) => (
            <Button
              key={project.id}
              variant={selectedProjectId === project.id ? "secondary" : "ghost"}
              className="justify-start w-full truncate"
              onClick={() => onSelectProject(project.id)}
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              {project.name}
            </Button>
          ))}
          <Button variant="outline" className="justify-start w-full mt-2" onClick={() => onSelectProject(null)}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>
      <div>
        <div className="text-sm text-muted-foreground mb-2">Files</div>
        <label className="flex items-center gap-2 cursor-pointer text-primary hover:underline">
          <FilePlus className="w-4 h-4" />
          <span>Upload File</span>
          <input
            type="file"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) onFileUpload(e.target.files[0]);
            }}
          />
        </label>
      </div>
    </aside>
  );
}
