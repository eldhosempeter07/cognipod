import CreateGroupForm from "../components/createGroupForm";

export default function CreateGroupPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Create a New Study Group
        </h1>
        <CreateGroupForm />
      </div>
    </div>
  );
}
