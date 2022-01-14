OUT_DIR=dist
OUT_EXT=.lsrules
SRC_DIR=src
SRC_EXT=.mjs

.PHONY: all clean githubusercontent malware-filter

all: githubusercontent malware-filter

clean:
	rm -rf $(OUT_DIR)

githubusercontent: $(OUT_DIR)
	$(SRC_DIR)/githubusercontent$(SRC_EXT) $(OUT_DIR)/easylist$(OUT_EXT) $(OUT_DIR)/easyprivacy$(OUT_EXT)

malware-filter: $(OUT_DIR)
	$(SRC_DIR)/malware-filter$(SRC_EXT) $(OUT_DIR)/urlhaus$(OUT_EXT) $(OUT_DIR)/phishing$(OUT_EXT) $(OUT_DIR)/pup$(OUT_EXT)

$(OUT_DIR):
	mkdir -p $(OUT_DIR)
