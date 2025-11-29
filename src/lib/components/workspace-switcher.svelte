<script lang="ts">
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    import { useSidebar } from "$lib/components/ui/sidebar/index.js";
    import { Badge } from "$lib/components/ui/badge/index.js";
    import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
    import PlusIcon from "@lucide/svelte/icons/plus";
    import GalleryVerticalEndIcon from "@lucide/svelte/icons/gallery-vertical-end";
    import AudioWaveformIcon from "@lucide/svelte/icons/audio-waveform";
    import CommandIcon from "@lucide/svelte/icons/command";

    const workspaces =  [
      {
        name: "Acme Inc",
        logo: GalleryVerticalEndIcon,
        plan: "Enterprise",
      },
      {
        name: "Acme Corp.",
        logo: AudioWaveformIcon,
        plan: "Premium",
      },
      {
        name: "Evil Corp.",
        logo: CommandIcon,
        plan: "Free",
      },
    ]
    
    const sidebar = useSidebar();
    let activeWorkspace = $state(workspaces[0]);
  </script>

  <Sidebar.Menu>
    <Sidebar.MenuItem>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          {#snippet child({ props })}
            <Sidebar.MenuButton
              {...props}
              class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div
                class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-6 items-center justify-center rounded-sm"
              >
                <activeWorkspace.logo class="size-4" />
              </div>
              <div class="flex-1 flex items-center justify-between text-start text-sm leading-tight">
                <span class="truncate font-medium">
                  {activeWorkspace.name}
                </span>
                <Badge variant="secondary" class="w-fit truncate text-xs">
                  {activeWorkspace.plan}
                </Badge>
              </div>
              <ChevronsUpDownIcon class="ms-auto" />
            </Sidebar.MenuButton>
          {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
          align="start"
          side={sidebar.isMobile ? "bottom" : "right"}
          sideOffset={4}
        >
          <DropdownMenu.Label class="text-muted-foreground text-xs">Workspaces</DropdownMenu.Label>
          {#each workspaces as workspace, index (workspace.name)}
            <DropdownMenu.Item onSelect={() => (activeWorkspace = workspace)} class="gap-2 p-2">
              <div class="flex size-6 items-center justify-center rounded-md border">
                <workspace.logo class="size-3.5 shrink-0" />
              </div>
              {workspace.name}
              <DropdownMenu.Shortcut>⌘{index + 1}</DropdownMenu.Shortcut>
            </DropdownMenu.Item>
          {/each}
          <DropdownMenu.Separator />
          <DropdownMenu.Item class="gap-2 p-2">
            <div
              class="flex size-6 items-center justify-center rounded-md border bg-transparent"
            >
              <PlusIcon class="size-4" />
            </div>
            <div class="text-muted-foreground font-medium">Add workspace</div>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </Sidebar.MenuItem>
  </Sidebar.Menu>

