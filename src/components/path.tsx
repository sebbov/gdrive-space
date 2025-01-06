import React from "react";

interface PathProps {
    value: string[];
    setCurrentRootPath: (path: string[]) => void;
}

const Path: React.FC<PathProps> = ({ value, setCurrentRootPath }) => {
    return (
        <div className="flex items-center whitespace-nowrap overflow-x-auto w-full">
            {value.map((component, index) => (
                <React.Fragment key={index}>
                    {index !== 0 && (
                        <span
                            className="p-2 text-1xl font-bold text-logo-space-blue select-none"
                        >
                            /
                        </span>
                    )}
                    <span
                        className={`${index === value.length - 1
                            ? "p-2 text-2xl font-bold text-logo-space-blue"
                            : "p-2 text-1xl font-bold text-logo-space-blue"
                            } cursor-pointer`}
                        onClick={() => setCurrentRootPath(value.slice(0, index + 1))}
                        onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
                        onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
                    >
                        {component}
                    </span>
                </React.Fragment>
            ))}
        </div>
    );
};

export default Path;
