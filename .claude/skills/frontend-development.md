# Frontend Development (React Router v7)

> **Skill**: React Router v7 development patterns for Taskcoda
> **Focus**: Routes, components, styling, data loading, real-time updates
> **Last Updated**: 2025-11-09

---

## React Router v7 Basics

### File-Based Routing

Routes are automatically created from files in `app/routes/`:

```
app/routes/
├── home.tsx               → /
├── pricing.tsx            → /pricing
├── contact.tsx            → /contact
├── dashboard/
│   ├── index.tsx          → /dashboard
│   ├── chat.tsx           → /dashboard/chat
│   ├── team.tsx           → /dashboard/team
│   └── billing.tsx        → /dashboard/billing
```

### Route Module Structure

```typescript
// app/routes/my-page.tsx
import { type Route } from "./+types/my-page";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Page | Taskcoda" },
    { name: "description", content: "Page description" }
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  // Server-side data loading
  return { data: "..." };
}

export async function action({ request }: Route.ActionArgs) {
  // Form submission handling
  const formData = await request.formData();
  // Process form
  return { success: true };
}

export default function MyPage({ loaderData }: Route.ComponentProps) {
  return <div>My Page Content</div>;
}
```

---

## Component Patterns

### shadcn/ui Components

Available components (in `app/components/ui/`):

```typescript
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "~/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Switch } from "~/components/ui/switch";
import { Slider } from "~/components/ui/slider";
import { Progress } from "~/components/ui/progress";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Skeleton } from "~/components/ui/skeleton";
import { Tooltip, TooltipTrigger, TooltipContent } from "~/components/ui/tooltip";
import { Separator } from "~/components/ui/separator";
import { Sidebar } from "~/components/ui/sidebar";
```

### Button Variants

```typescript
<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

### Card Example

```typescript
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Dialog Example

```typescript
import { useState } from "react";

function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog description</DialogDescription>
          </DialogHeader>
          <div>
            {/* Dialog content */}
          </div>
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

---

## Convex Integration

### Real-time Queries

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";

function MyComponent() {
  // Real-time query - updates automatically
  const organizations = useQuery(api.organizations.getUserOrganizations);

  // Mutation for write operations
  const createOrg = useMutation(api.organizations.createOrganization);

  if (organizations === undefined) {
    return <Skeleton className="h-20" />;
  }

  return (
    <div>
      {organizations.map(org => (
        <Card key={org._id}>
          <CardHeader>
            <CardTitle>{org.name}</CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
```

### Form with Mutation

```typescript
import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

function CreateOrganizationForm() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const createOrg = useMutation(api.organizations.createOrganization);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const orgId = await createOrg({ name, slug });
      toast.success("Organization created!");
      // Reset form
      setName("");
      setSlug("");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
        </div>

        <Button type="submit">Create Organization</Button>
      </div>
    </form>
  );
}
```

---

## Authentication (Clerk)

### Protected Routes

```typescript
import { useUser } from "@clerk/react-router";
import { redirect } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  // Authentication is handled by Clerk middleware
  return {};
}

export default function ProtectedPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <Skeleton className="h-screen" />;
  }

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div>
      <h1>Welcome, {user.firstName}!</h1>
    </div>
  );
}
```

### User Information

```typescript
import { useUser } from "@clerk/react-router";

function UserProfile() {
  const { user } = useUser();

  return (
    <div>
      <Avatar>
        <AvatarImage src={user?.imageUrl} />
        <AvatarFallback>{user?.firstName?.[0]}</AvatarFallback>
      </Avatar>
      <div>
        <p>{user?.fullName}</p>
        <p className="text-sm text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
      </div>
    </div>
  );
}
```

---

## Styling

### TailwindCSS v4

```typescript
// Utility classes
<div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
  <h2 className="text-2xl font-bold">Title</h2>
  <Button>Action</Button>
</div>

// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id}>{item.name}</Card>)}
</div>

// Dark mode
<div className="bg-white dark:bg-gray-800">
  <p className="text-gray-900 dark:text-gray-100">Text</p>
</div>
```

### Custom Utilities

```typescript
import { cn } from "~/lib/utils";

function MyComponent({ className }) {
  return (
    <div className={cn("base-classes", className)}>
      Content
    </div>
  );
}
```

---

## Layouts

### Dashboard Layout (app/routes/dashboard/layout.tsx)

```typescript
import { Outlet } from "react-router";
import { Sidebar } from "~/components/ui/sidebar";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar>
        {/* Sidebar content */}
      </Sidebar>

      <main className="flex-1 p-8">
        <Outlet /> {/* Child routes render here */}
      </main>
    </div>
  );
}
```

---

## Loading States

### Skeleton Components

```typescript
import { Skeleton } from "~/components/ui/skeleton";

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-8 w-1/2" />
    </div>
  );
}

// Usage with Convex query
function MyComponent() {
  const data = useQuery(api.myModule.myQuery);

  if (data === undefined) {
    return <LoadingSkeleton />;
  }

  return <div>{/* Render data */}</div>;
}
```

---

## Error Handling

### Error Boundaries

```typescript
import { isRouteErrorResponse, useRouteError } from "react-router";

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>{error.status} {error.statusText}</h1>
        <p>{error.data}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Something went wrong</h1>
      <p>{error?.message || "Unknown error"}</p>
    </div>
  );
}
```

### Toast Notifications

```typescript
import { toast } from "sonner";

// Success
toast.success("Operation successful!");

// Error
toast.error("Something went wrong");

// Info
toast.info("Information message");

// Warning
toast.warning("Warning message");

// Custom
toast("Custom message", {
  description: "Additional details",
  action: {
    label: "Undo",
    onClick: () => console.log("Undo"),
  },
});
```

---

## Icons

### Lucide React

```typescript
import {
  Home,
  Settings,
  Users,
  CreditCard,
  BarChart,
  MessageSquare,
  Check,
  X,
  Plus,
  Trash,
  Edit,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

<Button>
  <Plus className="h-4 w-4 mr-2" />
  Add Item
</Button>
```

### Tabler Icons

```typescript
import {
  IconBrandGithub,
  IconBrandTwitter,
  IconMail,
} from "@tabler/icons-react";

<IconBrandGithub className="h-6 w-6" />
```

---

## Animations (Framer Motion)

### Basic Animation

```typescript
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

### Stagger Children

```typescript
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

<motion.div variants={container} initial="hidden" animate="show">
  {items.map(item => (
    <motion.div key={item.id} variants={item}>
      {item.name}
    </motion.div>
  ))}
</motion.div>
```

---

## Tables

### Data Table

```typescript
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "~/components/ui/table";

function UsersTable({ users }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map(user => (
          <TableRow key={user._id}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Badge>{user.role}</Badge>
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

---

## Best Practices

1. **Use shadcn/ui components**: Consistent design system
2. **Real-time with Convex**: Automatic UI updates
3. **Loading states**: Always show skeletons while loading
4. **Error handling**: Use error boundaries and toast notifications
5. **Responsive design**: Mobile-first with Tailwind
6. **Type safety**: Use Route types for loaders/actions
7. **Accessibility**: Use semantic HTML and ARIA attributes
8. **Performance**: Lazy load heavy components
9. **Code splitting**: Use dynamic imports for large pages
10. **SEO**: Set proper meta tags for all pages

---

**All components follow shadcn/ui and TailwindCSS v4 patterns.**
