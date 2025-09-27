import Link from "next/link";
import { FaGithub } from "react-icons/fa";

const Footer = () => {
  const teamMembers = [
    { name: "박민재", github: "https://github.com/boonmojae" },
    { name: "김도이", github: "https://github.com/d0ikim" },
    { name: "김가연", github: "https://github.com/gayeon-00" },
    { name: "최아름", github: "https://github.com/Haleychoioi" },
    { name: "이하민", github: "https://github.com/haminee01" },
  ];

  return (
    <footer>
      <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 py-16">
        
        <div className="border-b border-gray-50 mb-12"></div>
        
        <div className="flex justify-between items-start">   
          
          <div className="flex flex-col">
            <h3 className="text-md font-bold mb-6">Team</h3>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {teamMembers.map((member, index) => (
                <Link
                  key={index}
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400"
                >
                  {member.name}
                </Link>
              ))}
            </div>
          </div>

          
          <div className="flex-shrink-0">
            <Link
              href="https://github.com/b1a4-CafeOn-final"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-12 h-12 bg-black rounded-full mr-5"
            >
              <FaGithub className="w-6 h-6 text-white" />
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;