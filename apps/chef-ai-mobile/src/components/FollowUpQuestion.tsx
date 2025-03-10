import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FollowUpQA, Recipe, RecipeVariation } from '../lib/types';
import { askFollowUpQuestion, applyRecipeVariation } from '../lib/recipeVariations';

interface FollowUpQuestionProps {
  recipe: Recipe;
  onUpdateRecipe: (updatedRecipe: Recipe) => void;
}

const FollowUpQuestion: React.FC<FollowUpQuestionProps> = ({ recipe, onUpdateRecipe }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedQA, setExpandedQA] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const followUps = recipe.followUps || [];

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    
    setLoading(true);
    try {
      const result = await askFollowUpQuestion(recipe.id, question);
      
      // Update the recipe with the new follow-up question
      const updatedFollowUps = [...(recipe.followUps || []), result];
      const updatedRecipe = { ...recipe, followUps: updatedFollowUps };
      
      onUpdateRecipe(updatedRecipe);
      setQuestion('');
      setExpandedQA(result.id);
      
      // Scroll to the bottom after a delay to ensure the UI has updated
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 300);
    } catch (error) {
      console.error('Error asking follow-up question:', error);
      Alert.alert('Error', 'Failed to process your question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyVariation = (followUpId: string, variationId?: string) => {
    // Find the follow-up question
    const followUp = followUps.find(fq => fq.id === followUpId);
    if (!followUp) return;
    
    // Apply the variation
    const updatedRecipe = applyRecipeVariation(recipe, followUpId, variationId);
    onUpdateRecipe(updatedRecipe);
    
    // Show confirmation to user
    Alert.alert(
      'Recipe Updated',
      'The recipe has been updated with your requested change.',
      [{ text: 'OK' }]
    );
  };

  const toggleExpandQA = (id: string) => {
    setExpandedQA(expandedQA === id ? null : id);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.headerContainer}>
        <Ionicons name="chatbubble-ellipses" size={22} color="#006E52" style={styles.headerIcon} />
        <Text style={styles.title}>Recipe Questions</Text>
      </View>
      
      <Text style={styles.subtitle}>
        Ask about ingredient substitutions, cooking techniques, storage tips, and more!
      </Text>
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.qaContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {followUps.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="help-circle-outline" size={36} color="#aaa" />
            <Text style={styles.noQuestionsText}>
              Ask questions about this recipe, like how to substitute ingredients or adjust cooking times.
            </Text>
          </View>
        ) : (
          followUps.map((qa) => (
            <View key={qa.id} style={styles.qaItem}>
              <TouchableOpacity 
                onPress={() => toggleExpandQA(qa.id)}
                style={styles.questionHeader}
              >
                <View style={styles.questionRow}>
                  <Ionicons 
                    name="help-circle" 
                    size={18} 
                    color="#006E52" 
                    style={styles.icon} 
                  />
                  <Text style={styles.questionText}>{qa.question}</Text>
                </View>
                <Ionicons 
                  name={expandedQA === qa.id ? "chevron-up" : "chevron-down"} 
                  size={18} 
                  color="#888" 
                />
              </TouchableOpacity>
              
              {expandedQA === qa.id && (
                <View style={styles.answerContainer}>
                  <View style={styles.answerRow}>
                    <Ionicons 
                      name="chatbubble" 
                      size={18} 
                      color="#888" 
                      style={styles.icon} 
                    />
                    <Text style={styles.answerText}>{qa.answer}</Text>
                  </View>
                  
                  {/* Only show the Apply button if this is about substitution and not already applied */}
                  {qa.answer.toLowerCase().includes('substitute') && !qa.appliedModificationId && (
                    <TouchableOpacity 
                      style={styles.applyButton}
                      onPress={() => handleApplyVariation(qa.id)}
                    >
                      <Text style={styles.applyButtonText}>Apply This Change</Text>
                    </TouchableOpacity>
                  )}
                  
                  {qa.appliedModificationId && (
                    <View style={styles.appliedIndicator}>
                      <Ionicons name="checkmark-circle" size={16} color="#006E52" />
                      <Text style={styles.appliedText}>Applied to recipe</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask a question about this recipe..."
          value={question}
          onChangeText={setQuestion}
          multiline
          maxLength={200}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !question.trim() && styles.sendButtonDisabled]}
          onPress={handleAskQuestion}
          disabled={!question.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E6F0EB',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#006E52',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  qaContainer: {
    flex: 1,
    marginBottom: 10,
    maxHeight: 300,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noQuestionsText: {
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  qaItem: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  icon: {
    marginRight: 8,
  },
  questionText: {
    flex: 1,
    fontWeight: '500',
    color: '#333',
  },
  answerContainer: {
    padding: 10,
    backgroundColor: '#fff',
  },
  answerRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  answerText: {
    flex: 1,
    color: '#555',
    lineHeight: 20,
  },
  applyButton: {
    backgroundColor: '#006E52',
    padding: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
    marginLeft: 26,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 12,
  },
  appliedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 26,
  },
  appliedText: {
    fontSize: 12,
    color: '#006E52',
    fontWeight: '500',
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 80,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#006E52',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#aaa',
  },
});

export default FollowUpQuestion; 