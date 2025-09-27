import Button from "@/components/common/Button";

export default function HomePage() {
  return (
    <div className="h-screen"><h1 className="text-4xl font-bold">HomePage</h1>
    <Button>Click me</Button>
    <Button color="warning">정지</Button>
    </div>
  );
}
