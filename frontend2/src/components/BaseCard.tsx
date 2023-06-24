import React from 'react';

interface BaseCardProps {
  GameImage: string;
  GameName: string;
  GameDescr: string;
  GameYear: number;
}

const YearCard: React.FC<BaseCardProps> = ({ GameImage, GameName, GameDescr, GameYear }) => {
  const redirect = (): void => {
    console.log(GameYear.toString()); // Redirect to year page
  };

  return (
    <div className="max-w-sm rounded overflow-hidden shadow-md transition duration-300 ease-in-out transform hover:shadow-lg hover:cursor-pointer" onClick={redirect}>
      <div className="aspect-w-4 aspect-h-3">
        <img className="object-cover" src={require(`../${GameImage}`)} alt={GameName} />
      </div>
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{GameName}</div>
        <p className="text-gray-700 text-base">{GameDescr}</p>
      </div>
    </div>
  );
};

export default YearCard;
