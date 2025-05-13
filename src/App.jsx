import { useState, useEffect } from "react";
import {
  Authenticator,
  Button,
  Text,
  TextField,
  Heading,
  Flex,
  View,
  Image,
  Grid,
  Divider,
  Card,
  TextAreaField,
  Loader,
} from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import { getUrl } from "aws-amplify/storage";
import { uploadData } from "aws-amplify/storage";
import { generateClient } from "aws-amplify/data";

import { client } from "./client";

import outputs from "../amplify_outputs.json";
/**
 * @type {import('aws-amplify/data').Client<import('../amplify/data/resource').Schema>}
 */

Amplify.configure(outputs);

export default function App() {
  const [notes, setNotes] = useState([]);

  // Function to generate a summary using Claude 3.5 Haiku
  const summarizeText = async (text) => {
    try {
      console.log("Sending text to summarize:", text);
      
      const response = await client.generations.generateSummary({
        description: text
      });
      
      console.log("Full AI response:", response);
      
      // Check if response and data exist
      if (response && response.data) {
        alert(response.data);
        return response.data;
      } else {
        console.error("Received empty response from AI service:", response);
        alert("Received empty response from AI service. Check console for details.");
        return null;
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      alert("Error generating summary: " + (error.message || "Unknown error"));
      return null;
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const { data: notes } = await client.models.Note.list();
    await Promise.all(
      notes.map(async (note) => {
        if (note.image) {
          const linkToStorageFile = await getUrl({
            path: ({ identityId }) => `media/${identityId}/${note.image}`,
          });
          console.log(linkToStorageFile.url);
          note.image = linkToStorageFile.url;
        }
        return note;
      })
    );
    console.log(notes);
    setNotes(notes);
  }

  async function createNote(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    // Check if an image was provided
    const imageFile = form.get("image");
    const imageName = imageFile && imageFile.name ? imageFile.name : null;
    
    // Create the note with or without an image
    const { data: newNote } = await client.models.Note.create({
      name: form.get("name"),
      description: form.get("description"),
      image: imageName,
    });

    console.log("New note created:", newNote);
    
    // Upload the image if one was provided
    if (newNote.image && imageFile && imageFile.size > 0) {
      await uploadData({
        path: ({ identityId }) => `media/${identityId}/${newNote.image}`,
        data: imageFile,
      }).result;
    }

    fetchNotes();
    event.target.reset();
  }

  async function deleteNote({ id }) {
    try {
      const toBeDeletedNote = {
        id: id,
      };

      const { data: deletedNote } = await client.models.Note.delete(
        toBeDeletedNote
      );
      console.log("Note deleted:", deletedNote);
      
      // Refresh the notes list
      fetchNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Failed to delete note. Check console for details.");
    }
  }
  
  // Function to summarize a specific note
  async function summarizeNoteContent(note) {
    if (!note.description) {
      alert("This note has no description to summarize.");
      return;
    }
    
    await summarizeText(note.description);
  }

  // Test function to verify AI summarization works
  const testSummarize = async () => {
    console.log("Testing AI summarization...");
    const testText = "This is a test text that needs to be summarized. It's a simple example to verify that the AI summarization feature is working correctly with the backend.";
    
    try {
      // Try direct API call without using the helper function
      console.log("Making direct API call to generations.generateSummary");
      
      // First approach - using client directly
      const directResponse = await client.generations.generateSummary({
        description: testText
      });
      
      console.log("Direct API response:", directResponse);
      
      if (directResponse && directResponse.data) {
        alert("Direct API call result: " + directResponse.data);
      } else {
        alert("Direct API call returned no data");
      }
    } catch (error) {
      console.error("Error in direct API call:", error);
      alert("Error in direct API call: " + (error.message || "Unknown error"));
    }
  };

  return (
    <Authenticator>
      {({ signOut }) => (
        <Flex
          className="App"
          justifyContent="center"
          alignItems="center"
          direction="column"
          width="70%"
          margin="0 auto"
        >
          <Heading level={1}>My Notes App</Heading>
          <Flex direction="column" gap="1rem" marginBottom="1rem">
            <Heading level={3}>AI Testing</Heading>
            <Flex direction="row" gap="1rem">
              <Button onClick={testSummarize} variation="primary">
                Test Direct API Call
              </Button>
              <Button 
                onClick={() => summarizeText("Write a funny summary about a notes app that lets you save memories and images.")} 
                variation="primary">
                Test Helper Function
              </Button>
            </Flex>
            <Text>Check browser console for detailed logs</Text>
          </Flex>
          <View as="form" margin="3rem 0" onSubmit={createNote}>
            <Flex
              direction="column"
              justifyContent="center"
              gap="2rem"
              padding="2rem"
            >
              <TextField
                name="name"
                placeholder="Note Name"
                label="Note Name"
                labelHidden
                variation="quiet"
                required
              />
              <TextField
                name="description"
                placeholder="Note Description"
                label="Note Description"
                labelHidden
                variation="quiet"
                required
              />
              <View
                name="image"
                as="input"
                type="file"
                alignSelf={"end"}
                accept="image/png, image/jpeg"
              />

              <Button type="submit" variation="primary">
                Create Note
              </Button>
            </Flex>
          </View>
          <Divider />
          <Heading level={2}>Current Notes</Heading>
          <Grid
            margin="3rem 0"
            autoFlow="column"
            justifyContent="center"
            gap="2rem"
            alignContent="center"
          >
            {notes.map((note) => (
              <Flex
                key={note.id || note.name}
                direction="column"
                justifyContent="center"
                alignItems="center"
                gap="2rem"
                border="1px solid #ccc"
                padding="2rem"
                borderRadius="5%"
                className="box"
              >
                <View>
                  <Heading level="3">{note.name}</Heading>
                </View>
                <Text fontStyle="italic">{note.description}</Text>
                {note.image && (
                  <Image
                    src={note.image}
                    alt={`visual aid for ${note.name}`}
                    style={{ width: 400 }}
                  />
                )}
                <Flex direction="row" gap="1rem">
                  <Button
                    variation="destructive"
                    onClick={() => deleteNote(note)}
                  >
                    Delete note
                  </Button>
                  <Button
                    variation="primary"
                    onClick={() => summarizeNoteContent(note)}
                  >
                    Summarize
                  </Button>
                </Flex>
              </Flex>
            ))}
          </Grid>
          <Button onClick={signOut}>Sign Out</Button>
        </Flex>
      )}
    </Authenticator>
  );
}