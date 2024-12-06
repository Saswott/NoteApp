import AddButton from "./AddButton";
import colors from '../assets/colors.json' 
import Color from "./color"; 

const Controls = () => {
  return (
    <div id="controls">
      <AddButton />
      {colors.map((color) => (
        <Color key={color.id} color={color} /> // Corrected usage
      ))}
    </div>
  );
};

export default Controls;
