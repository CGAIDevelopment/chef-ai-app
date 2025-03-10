import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { DietaryRestriction, SkillLevel } from '../lib/types';
import { useUserStore } from '../lib/userStore';

interface ProfileScreenProps {
  onBack: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack }) => {
  const { 
    user, 
    isLoading, 
    loadUserData, 
    toggleDietaryRestriction, 
    setSkillLevel, 
    toggleKitchenEquipment 
  } = useUserStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences'>('profile');
  const [isEditing, setIsEditing] = useState(false);

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  // Render profile information
  const renderProfile = () => (
    <View style={styles.profileContainer}>
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: user.avatar }}
          style={styles.avatar}
          defaultSource={{ uri: 'https://via.placeholder.com/100' }}
        />
        <View style={styles.userInfo}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.username}>@{user.username}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {new Date(user.createdAt).toLocaleDateString()}
          </Text>
          <Text style={styles.statLabel}>Joined</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {user.preferences.cookingSkillLevel}
          </Text>
          <Text style={styles.statLabel}>Skill Level</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {user.preferences.cuisinePreferences.length}
          </Text>
          <Text style={styles.statLabel}>Cuisines</Text>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>About Me</Text>
        <Text style={styles.aboutText}>
          I love cooking and trying new recipes! I'm especially interested in {user.preferences.cuisinePreferences.join(', ')} cuisine.
        </Text>
      </View>
    </View>
  );

  // Render user preferences
  const renderPreferences = () => (
    <View style={styles.preferencesContainer}>
      <View style={styles.preferencesSection}>
        <Text style={styles.sectionTitle}>Dietary Restrictions</Text>
        <View style={styles.optionsGrid}>
          {['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo', 'none'].map(
            (restriction) => (
              <TouchableOpacity
                key={restriction}
                style={[
                  styles.optionButton,
                  user.preferences.dietaryRestrictions.includes(restriction) &&
                    styles.selectedOption,
                  !isEditing && styles.disabledOption,
                ]}
                onPress={() => {
                  if (isEditing) {
                    toggleDietaryRestriction(restriction as DietaryRestriction);
                  }
                }}
                disabled={!isEditing}
              >
                <Text
                  style={[
                    styles.optionText,
                    user.preferences.dietaryRestrictions.includes(restriction) &&
                      styles.selectedOptionText,
                  ]}
                >
                  {restriction.charAt(0).toUpperCase() + restriction.slice(1)}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>

      <View style={styles.preferencesSection}>
        <Text style={styles.sectionTitle}>Cooking Skill Level</Text>
        <View style={styles.skillLevelContainer}>
          {['beginner', 'intermediate', 'advanced'].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.skillButton,
                user.preferences.cookingSkillLevel === level &&
                  styles.selectedSkill,
                !isEditing && styles.disabledOption,
              ]}
              onPress={() => {
                if (isEditing) {
                  setSkillLevel(level as SkillLevel);
                }
              }}
              disabled={!isEditing}
            >
              <Text
                style={[
                  styles.skillText,
                  user.preferences.cookingSkillLevel === level &&
                    styles.selectedSkillText,
                ]}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.preferencesSection}>
        <Text style={styles.sectionTitle}>Kitchen Equipment</Text>
        <View style={styles.equipmentList}>
          {user.preferences.kitchenEquipment.map((equipment) => (
            <View key={equipment.name} style={styles.equipmentItem}>
              <Text style={styles.equipmentName}>{equipment.name}</Text>
              <Switch
                value={equipment.available}
                onValueChange={() => {
                  if (isEditing) {
                    toggleKitchenEquipment(equipment.name);
                  }
                }}
                trackColor={{ false: '#d1d1d1', true: '#c8e6c9' }}
                thumbColor={equipment.available ? '#4A7856' : '#f4f3f4'}
                disabled={!isEditing}
              />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.preferencesSection}>
        <Text style={styles.sectionTitle}>Cuisine Preferences</Text>
        <View style={styles.cuisineContainer}>
          {user.preferences.cuisinePreferences.map((cuisine) => (
            <View key={cuisine} style={styles.cuisineTag}>
              <Text style={styles.cuisineText}>{cuisine}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={toggleEditMode} style={styles.editButton}>
          <Text style={styles.editButtonText}>
            {isEditing ? 'Done' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
          onPress={() => setActiveTab('profile')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'profile' && styles.activeTabText,
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'preferences' && styles.activeTab]}
          onPress={() => setActiveTab('preferences')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'preferences' && styles.activeTabText,
            ]}
          >
            Preferences
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'profile' ? renderProfile() : renderPreferences()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 22,
    color: '#4A7856',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    fontSize: 16,
    color: '#4A7856',
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4A7856',
  },
  tabText: {
    fontSize: 16,
    color: '#666666',
  },
  activeTabText: {
    color: '#4A7856',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileContainer: {
    flex: 1,
  },
  avatarContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666666',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A7856',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  preferencesContainer: {
    flex: 1,
  },
  preferencesSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  optionButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
  },
  selectedOption: {
    backgroundColor: '#4A7856',
  },
  disabledOption: {
    opacity: 0.7,
  },
  optionText: {
    fontSize: 14,
    color: '#666666',
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  skillLevelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skillButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  selectedSkill: {
    backgroundColor: '#4A7856',
  },
  skillText: {
    fontSize: 14,
    color: '#666666',
  },
  selectedSkillText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  equipmentList: {
    marginTop: 8,
  },
  equipmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  equipmentName: {
    fontSize: 14,
    color: '#333333',
  },
  cuisineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  cuisineTag: {
    backgroundColor: '#E6F0EB',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
  },
  cuisineText: {
    fontSize: 14,
    color: '#4A7856',
  },
});

export default ProfileScreen; 