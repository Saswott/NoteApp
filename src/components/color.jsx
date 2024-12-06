import React, { useContext } from "react";
import { NoteContext } from "../context/NoteContext";
import { db } from "../appwrite/database";

const Color = ({ color }) => {
  const { selectedNote, notes, setNotes } = useContext(NoteContext);

  const changeColor = async () => {
    try {
      if (!selectedNote) {
        alert("You must select a note before changing colors.");
        return;
      }

      
      const currentNoteIndex = notes.findIndex(
        (note) => note.$id === selectedNote.$id
      );

      if (currentNoteIndex === -1) {
        alert("Selected note not found.");
        return;
      }

      
      const updatedNote = {
        ...notes[currentNoteIndex],
        colors: JSON.stringify(color), 
      };

      
      const newNotes = [...notes];
      newNotes[currentNoteIndex] = updatedNote;
      setNotes(newNotes);

      
      await db.notes.update(selectedNote.$id, { colors: JSON.stringify(color) });
    } catch (error) {
      console.error("Error updating color:", error);
    }
  };

  return (
    <div
      className="color"
      onClick={changeColor}
      style={{ backgroundColor: color.colorHeader }}
    ></div>
  );
};

export default Color;
