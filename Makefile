OUT_DIR=dist
OUT_EXT=.lsrules
SRC_DIR=src
SRC_EXT=.mjs

.PHONY: all clean as githubusercontent malware-filter

all: as githubusercontent malware-filter

clean:
	rm -rf $(OUT_DIR)

as: $(OUT_DIR)
	$(SRC_DIR)/as$(SRC_EXT) $(OUT_DIR)/as$(OUT_EXT)

githubusercontent: $(OUT_DIR)
	$(SRC_DIR)/githubusercontent$(SRC_EXT) $(OUT_DIR)/easylist$(OUT_EXT) $(OUT_DIR)/easyprivacy$(OUT_EXT)

malware-filter: $(OUT_DIR)
	$(SRC_DIR)/malware-filter$(SRC_EXT) $(OUT_DIR)/urlhaus$(OUT_EXT) $(OUT_DIR)/phishing$(OUT_EXT) $(OUT_DIR)/pup$(OUT_EXT)

$(OUT_DIR):
	mkdir -p $(OUT_DIR)
