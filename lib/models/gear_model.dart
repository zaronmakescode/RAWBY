// ============================================================
// RAWBY — Gear & Subscription Models
// ============================================================
import 'package:hive/hive.dart';


@HiveType(typeId: 8)
class GearItem extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  String name;

  @HiveField(2)
  String category; // 'filming', 'editing', 'digital'

  @HiveField(3)
  String usageState; // 'active', 'rested', 'retired'

  @HiveField(4)
  bool isNewPurchase;

  @HiveField(5)
  int pointCost; // deducted from totalScore if isNewPurchase

  @HiveField(6)
  DateTime addedAt;

  @HiveField(7)
  DateTime? lastUsedAt;

  @HiveField(8)
  List<String> usedInProjectIds;

  @HiveField(9)
  String notes;

  GearItem({
    required this.id,
    required this.name,
    required this.category,
    this.usageState = 'active',
    this.isNewPurchase = false,
    this.pointCost = 0,
    required this.addedAt,
    this.lastUsedAt,
    this.usedInProjectIds = const [],
    this.notes = '',
  });

  /// Returns true if gear has been used but idle for 30+ days
  bool get shouldSuggestRest {
    if (usageState == 'rested' || usageState == 'retired') return false;
    if (usedInProjectIds.isEmpty) return false;
    if (lastUsedAt == null) return false;
    final daysSinceUse = DateTime.now().difference(lastUsedAt!).inDays;
    return daysSinceUse >= 30;
  }

  GearItem copyWith({
    String? id,
    String? name,
    String? category,
    String? usageState,
    bool? isNewPurchase,
    int? pointCost,
    DateTime? addedAt,
    DateTime? lastUsedAt,
    List<String>? usedInProjectIds,
    String? notes,
  }) {
    return GearItem(
      id: id ?? this.id,
      name: name ?? this.name,
      category: category ?? this.category,
      usageState: usageState ?? this.usageState,
      isNewPurchase: isNewPurchase ?? this.isNewPurchase,
      pointCost: pointCost ?? this.pointCost,
      addedAt: addedAt ?? this.addedAt,
      lastUsedAt: lastUsedAt ?? this.lastUsedAt,
      usedInProjectIds: usedInProjectIds ?? this.usedInProjectIds,
      notes: notes ?? this.notes,
    );
  }

  factory GearItem.fromJson(Map<String, dynamic> json) => GearItem(
        id: json['id'] as String? ?? '',
        name: json['name'] as String? ?? json['label'] as String? ?? '',
        category: json['category'] as String? ?? 'filming',
        usageState: json['usageState'] as String? ?? 'active',
        isNewPurchase: json['isNewPurchase'] as bool? ?? false,
        pointCost: (json['pointCost'] as num?)?.toInt() ?? 0,
        addedAt: json['addedAt'] != null
            ? DateTime.parse(json['addedAt'] as String)
            : DateTime.now(),
        lastUsedAt: json['lastUsedAt'] != null
            ? DateTime.tryParse(json['lastUsedAt'] as String)
            : null,
        usedInProjectIds: (json['usedInProjectIds'] as List<dynamic>?)
                ?.map((e) => e as String)
                .toList() ??
            [],
        notes: json['notes'] as String? ?? '',
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'category': category,
        'usageState': usageState,
        'isNewPurchase': isNewPurchase,
        'pointCost': pointCost,
        'addedAt': addedAt.toIso8601String(),
        'lastUsedAt': lastUsedAt?.toIso8601String(),
        'usedInProjectIds': usedInProjectIds,
        'notes': notes,
      };
}

@HiveType(typeId: 9)
class Subscription extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  String name;

  @HiveField(2)
  double costHuf; // cost in Hungarian Forint

  @HiveField(3)
  String frequency; // 'monthly' or 'yearly'

  @HiveField(4)
  String category; // 'filming', 'editing', 'digital'

  @HiveField(5)
  DateTime addedAt;

  @HiveField(6)
  bool isActive;

  Subscription({
    required this.id,
    required this.name,
    required this.costHuf,
    required this.frequency,
    required this.category,
    required this.addedAt,
    this.isActive = true,
  });

  /// Annual cost in HUF
  double get annualCostHuf {
    if (frequency == 'yearly') return costHuf;
    return costHuf * 12;
  }

  Subscription copyWith({
    String? id,
    String? name,
    double? costHuf,
    String? frequency,
    String? category,
    DateTime? addedAt,
    bool? isActive,
  }) {
    return Subscription(
      id: id ?? this.id,
      name: name ?? this.name,
      costHuf: costHuf ?? this.costHuf,
      frequency: frequency ?? this.frequency,
      category: category ?? this.category,
      addedAt: addedAt ?? this.addedAt,
      isActive: isActive ?? this.isActive,
    );
  }

  factory Subscription.fromJson(Map<String, dynamic> json) => Subscription(
        id: json['id'] as String? ?? '',
        name: json['name'] as String? ?? '',
        costHuf: (json['costHuf'] as num?)?.toDouble() ?? 0.0,
        frequency: json['frequency'] as String? ?? 'monthly',
        category: json['category'] as String? ?? 'digital',
        addedAt: json['addedAt'] != null
            ? DateTime.parse(json['addedAt'] as String)
            : DateTime.now(),
        isActive: json['isActive'] as bool? ?? true,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'costHuf': costHuf,
        'frequency': frequency,
        'category': category,
        'addedAt': addedAt.toIso8601String(),
        'isActive': isActive,
      };
}
