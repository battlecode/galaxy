import React from 'react';

interface BaseCardProps {
  gameImage: string;
  gameName: string;
  gameDescr: string;
  gameYear: number;
}

const BaseCard: React.FC<BaseCardProps> = ({ gameImage, gameName, gameDescr, gameYear }): JSX.Element => {
  const redirect = (): void => {
    console.log(gameYear.toString()); // Redirect to year page
  };

  return (
    <div className="max-w-sm rounded overflow-hidden shadow-md transition duration-300 ease-in-out transform hover:shadow-lg hover:cursor-pointer" onClick={redirect}>
      <div className="aspect-w-4 aspect-h-3">
        <img className="object-cover" src={require(`../${gameImage}`)} alt={gameName} />
      </div>
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{gameName}</div>
        <p className="text-gray-700 text-base">{gameDescr}</p>
      </div>
    </div>
  );
};

export default BaseCard;
