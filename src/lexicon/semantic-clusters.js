/**
 * SEMANTIC-CLUSTERS.JS
 * Curated semantic clusters for Match Deck Builder & Vocabulary Rotation.
 * Each cluster consists of balanced antonym pairs with internal synonym links.
 * Guarantees zero isolated nodes, rich Wort-Kette connectivity, and GEGENTEIL action card targets.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SEMANTIC_CLUSTERS = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const SEMANTIC_CLUSTERS = {
    adjective: [
      {
        clusterId: 'cluster_adj_difficulty',
        nameVi: 'Độ khó (Khó ↔ Dễ)',
        topic: 'Schwierigkeit',
        contexts: ['ctx_adjective_difficult', 'ctx_adjective_easy'],
        entryIds: ['adj_schwer_difficult', 'adj_schwierig_difficult', 'adj_leicht_easy', 'adj_einfach_easy']
      },
      {
        clusterId: 'cluster_adj_price',
        nameVi: 'Mức giá (Đắt ↔ Rẻ)',
        topic: 'Preis',
        contexts: ['ctx_adjective_expensive', 'ctx_adjective_cheap'],
        entryIds: ['adj_teuer_expensive', 'adj_kostspielig_expensive', 'adj_billig_cheap', 'adj_günstig_cheap']
      },
      {
        clusterId: 'cluster_adj_volume',
        nameVi: 'Âm lượng (Yên tĩnh ↔ Ồn ào)',
        topic: 'Lautstärke',
        contexts: ['ctx_adjective_quiet', 'ctx_adjective_loud'],
        entryIds: ['adj_leise_quiet', 'adj_ruhig_quiet', 'adj_laut_loud', 'adj_lärmend_loud']
      },
      {
        clusterId: 'cluster_adj_speed',
        nameVi: 'Tốc độ (Nhanh ↔ Chậm)',
        topic: 'Geschwindigkeit',
        contexts: ['ctx_adjective_fast', 'ctx_adjective_slow'],
        entryIds: ['adj_schnell_fast', 'adj_rasch_fast', 'adj_langsam_slow', 'adj_gemächlich_slow']
      },
      {
        clusterId: 'cluster_adj_size',
        nameVi: 'Kích thước (To lớn ↔ Nhỏ bé)',
        topic: 'Größe',
        contexts: ['ctx_adjective_large', 'ctx_adjective_small'],
        entryIds: ['adj_groß_large', 'adj_riesig_large', 'adj_klein_small', 'adj_winzig_small']
      },
      {
        clusterId: 'cluster_adj_strength',
        nameVi: 'Sức mạnh (Khỏe ↔ Yếu)',
        topic: 'Stärke',
        contexts: ['ctx_adjective_strong', 'ctx_adjective_weak'],
        entryIds: ['adj_stark_strong', 'adj_kräftig_strong', 'adj_schwach_weak', 'adj_kraftlos_weak']
      },
      {
        clusterId: 'cluster_adj_courage',
        nameVi: 'Dũng cảm (Gan dạ ↔ Nhút nhát)',
        topic: 'Mut',
        contexts: ['ctx_adjective_brave', 'ctx_adjective_fearful'],
        entryIds: ['adj_mutig_brave', 'adj_tapfer_brave', 'adj_ängstlich_fearful', 'adj_furchtsam_fearful']
      },
      {
        clusterId: 'cluster_adj_smartness',
        nameVi: 'Trí tuệ (Thông minh ↔ Khờ dại)',
        topic: 'Klugheit',
        contexts: ['ctx_adjective_smart', 'ctx_adjective_foolish'],
        entryIds: ['adj_klug_smart', 'adj_schlau_smart', 'adj_dumm_foolish', 'adj_töricht_foolish']
      },
      {
        clusterId: 'cluster_adj_age',
        nameVi: 'Tuổi thọ & Trạng thái (Cũ ↔ Mới)',
        topic: 'Alter & Zustand',
        contexts: ['ctx_adjective_old_object', 'ctx_adjective_new_object'],
        entryIds: ['adj_alt_old_object', 'adj_antik_old_object', 'adj_neu_new_object', 'adj_frisch_new_object']
      }
    ],
    verb: [
      {
        clusterId: 'cluster_verb_time',
        nameVi: 'Tiến trình (Bắt đầu ↔ Kết thúc)',
        topic: 'Zeitlicher Verlauf',
        contexts: ['ctx_verb_start', 'ctx_verb_stop'],
        entryIds: ['verb_beginnen_start', 'verb_anfangen_start', 'verb_enden_stop', 'verb_aufhören_stop']
      },
      {
        clusterId: 'cluster_verb_door',
        nameVi: 'Đóng / Mở (Mở ra ↔ Đóng lại)',
        topic: 'Öffnen / Schließen',
        contexts: ['ctx_verb_open', 'ctx_verb_close'],
        entryIds: ['verb_öffnen_open', 'verb_aufmachen_open', 'verb_schließen_close', 'verb_zumachen_close']
      },
      {
        clusterId: 'cluster_verb_pace',
        nameVi: 'Nhịp độ (Vội vã ↔ Lề mề)',
        topic: 'Tempo',
        contexts: ['ctx_verb_hurry', 'ctx_verb_dawdle'],
        entryIds: ['verb_sich_beeilen_hurry', 'verb_eilen_hurry', 'verb_trödeln_dawdle', 'verb_bummeln_dawdle']
      },
      {
        clusterId: 'cluster_verb_social',
        nameVi: 'Tương tác (Giúp đỡ ↔ Quấy rầy)',
        topic: 'Soziales Verhalten',
        contexts: ['ctx_verb_help', 'ctx_verb_disturb'],
        entryIds: ['verb_helfen_help', 'verb_unterstützen_help', 'verb_stören_disturb', 'verb_behindern_disturb']
      },
      {
        clusterId: 'cluster_verb_possession',
        nameVi: 'Sở hữu (Tìm thấy ↔ Đánh mất)',
        topic: 'Besitz & Auffinden',
        contexts: ['ctx_verb_find', 'ctx_verb_lose'],
        entryIds: ['verb_finden_find', 'verb_entdecken_find', 'verb_verlieren_lose', 'verb_verlegen_lose']
      },
      {
        clusterId: 'cluster_verb_commerce',
        nameVi: 'Thương mại (Mua ↔ Bán)',
        topic: 'Handel',
        contexts: ['ctx_verb_buy', 'ctx_verb_sell'],
        entryIds: ['verb_kaufen_buy', 'verb_erwerben_buy', 'verb_verkaufen_sell', 'verb_veräußern_sell']
      },
      {
        clusterId: 'cluster_verb_travel',
        nameVi: 'Hành trình (Đến nơi ↔ Khởi hành)',
        topic: 'Reise',
        contexts: ['ctx_verb_arrive', 'ctx_verb_depart'],
        entryIds: ['verb_ankommen_arrive', 'verb_eintreffen_arrive', 'verb_abfahren_depart', 'verb_abreisen_depart']
      },
      {
        clusterId: 'cluster_verb_cognition',
        nameVi: 'Nhận thức (Thấu hiểu ↔ Hiểu lầm)',
        topic: 'Kognition',
        contexts: ['ctx_verb_understand', 'ctx_verb_misunderstand'],
        entryIds: ['verb_verstehen_understand', 'verb_begreifen_understand', 'verb_missverstehen_misunderstand', 'verb_fehldeuten_misunderstand']
      }
    ]
  };

  return SEMANTIC_CLUSTERS;
});
