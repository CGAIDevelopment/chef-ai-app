import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Recipe } from '../lib/types';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: (recipe: Recipe) => void;
  horizontal?: boolean;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onPress, horizontal = false }) => {
  return (
    <TouchableOpacity 
      style={[styles.card, horizontal && styles.horizontalCard]}
      onPress={() => onPress(recipe)}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: recipe.image }} 
        style={[styles.image, horizontal && styles.horizontalImage]}
        defaultSource={{ uri: 'https://via.placeholder.com/150' }}
      />
      <View style={[styles.infoContainer, horizontal && styles.horizontalInfoContainer]}>
        <Text 
          style={styles.title} 
          numberOfLines={horizontal ? 1 : 2}
        >
          {recipe.title}
        </Text>
        <View style={styles.metaContainer}>
          <Text style={styles.servings}>{recipe.servings} servings</Text>
          <View style={styles.nutritionPill}>
            <Text style={styles.calories}>{recipe.nutritionalValue.calories} cal</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  horizontalCard: {
    width: 220,
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: '#F0F0F0',
  },
  horizontalImage: {
    height: 140,
  },
  infoContainer: {
    padding: 12,
  },
  horizontalInfoContainer: {
    height: 80,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 6,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servings: {
    fontSize: 12,
    color: '#666666',
  },
  nutritionPill: {
    backgroundColor: '#E6F0EB',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  calories: {
    fontSize: 12,
    color: '#4A7856',
    fontWeight: '600',
  },
});

export default RecipeCard; 